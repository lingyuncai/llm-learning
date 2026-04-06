import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface StageProps {
  stages: { label: string; color: string; desc: string }[];
  title: string;
}

function Pipeline({ stages, title }: StageProps) {
  const stageW = (W - 60) / stages.length;
  const stageH = 50;
  const y = 50;
  return (
    <svg viewBox={`0 0 ${W} 140`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{title}</text>
      {stages.map((s, i) => {
        const x = 30 + i * stageW;
        return (
          <g key={i}>
            <rect x={x + 2} y={y} width={stageW - 4} height={stageH} rx={6}
              fill={s.color} opacity={0.15} stroke={s.color} strokeWidth="1.5" />
            <text x={x + stageW / 2} y={y + 22} textAnchor="middle" fontSize="10"
              fontWeight="700" fill={COLORS.dark} fontFamily={FONTS.sans}>{s.label}</text>
            <text x={x + stageW / 2} y={y + 38} textAnchor="middle" fontSize="8"
              fill={COLORS.mid} fontFamily={FONTS.sans}>{s.desc}</text>
            {i < stages.length - 1 && (
              <text x={x + stageW - 1} y={y + stageH / 2 + 4} textAnchor="middle"
                fontSize="14" fill={COLORS.mid}>→</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function RequestLifecycleCompare({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      vllmTitle: '云端 Serving (vLLM)',
      vllmPipelineTitle: 'vLLM 请求流程 — 吞吐优先',
      vllmStages: [
        { label: 'API 请求', desc: 'OpenAI 兼容' },
        { label: 'Scheduler', desc: '调度 + 批处理' },
        { label: 'PagedAttention', desc: '分页 KV 管理' },
        { label: 'GPU 推理', desc: 'Batch decode' },
        { label: 'Stream 输出', desc: 'SSE 流式返回' },
      ],
      ollamaTitle: '本地推理 (Ollama)',
      ollamaPipelineTitle: 'Ollama 请求流程 — 易用优先',
      ollamaStages: [
        { label: 'CLI / API', desc: 'ollama run' },
        { label: '模型加载', desc: 'GGUF 量化' },
        { label: 'llama.cpp', desc: '单请求推理' },
        { label: '输出', desc: '逐 token 打印' },
      ],
      sglangTitle: '可编程管道 (SGLang)',
      sglangPipelineTitle: 'SGLang 请求流程 — 可编程优先',
      sglangStages: [
        { label: 'DSL 程序', desc: 'gen/fork/join' },
        { label: 'IR 编排', desc: '执行计划优化' },
        { label: 'RadixAttention', desc: '前缀缓存复用' },
        { label: 'GPU 推理', desc: '约束解码' },
        { label: '结构化输出', desc: 'JSON/Schema' },
      ],
    },
    en: {
      vllmTitle: 'Cloud Serving (vLLM)',
      vllmPipelineTitle: 'vLLM Request Flow — Throughput First',
      vllmStages: [
        { label: 'API Request', desc: 'OpenAI compatible' },
        { label: 'Scheduler', desc: 'Schedule + batch' },
        { label: 'PagedAttention', desc: 'Paged KV mgmt' },
        { label: 'GPU Inference', desc: 'Batch decode' },
        { label: 'Stream Output', desc: 'SSE streaming' },
      ],
      ollamaTitle: 'Local Inference (Ollama)',
      ollamaPipelineTitle: 'Ollama Request Flow — Ease of Use First',
      ollamaStages: [
        { label: 'CLI / API', desc: 'ollama run' },
        { label: 'Model Load', desc: 'GGUF quantized' },
        { label: 'llama.cpp', desc: 'Single request' },
        { label: 'Output', desc: 'Token by token' },
      ],
      sglangTitle: 'Programmable Pipeline (SGLang)',
      sglangPipelineTitle: 'SGLang Request Flow — Programmability First',
      sglangStages: [
        { label: 'DSL Program', desc: 'gen/fork/join' },
        { label: 'IR Orchestration', desc: 'Execution plan opt' },
        { label: 'RadixAttention', desc: 'Prefix cache reuse' },
        { label: 'GPU Inference', desc: 'Constrained decode' },
        { label: 'Structured Output', desc: 'JSON/Schema' },
      ],
    },
  }[locale];

  const colors = [COLORS.primary, COLORS.orange, COLORS.green, COLORS.purple, COLORS.primary];

  const steps = [
    {
      title: t.vllmTitle,
      content: (
        <Pipeline title={t.vllmPipelineTitle} stages={t.vllmStages.map((s, i) => ({ ...s, color: colors[i] }))} />
      ),
    },
    {
      title: t.ollamaTitle,
      content: (
        <Pipeline title={t.ollamaPipelineTitle} stages={t.ollamaStages.map((s, i) => ({ ...s, color: colors[i] }))} />
      ),
    },
    {
      title: t.sglangTitle,
      content: (
        <Pipeline title={t.sglangPipelineTitle} stages={t.sglangStages.map((s, i) => ({ ...s, color: colors[i] }))} />
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
