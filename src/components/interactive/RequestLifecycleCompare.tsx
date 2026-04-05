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

export default function RequestLifecycleCompare() {
  const steps = [
    {
      title: '云端 Serving (vLLM)',
      content: (
        <Pipeline title="vLLM 请求流程 — 吞吐优先" stages={[
          { label: 'API 请求', color: COLORS.primary, desc: 'OpenAI 兼容' },
          { label: 'Scheduler', color: COLORS.orange, desc: '调度 + 批处理' },
          { label: 'PagedAttention', color: COLORS.green, desc: '分页 KV 管理' },
          { label: 'GPU 推理', color: COLORS.purple, desc: 'Batch decode' },
          { label: 'Stream 输出', color: COLORS.primary, desc: 'SSE 流式返回' },
        ]} />
      ),
    },
    {
      title: '本地推理 (Ollama)',
      content: (
        <Pipeline title="Ollama 请求流程 — 易用优先" stages={[
          { label: 'CLI / API', color: COLORS.orange, desc: 'ollama run' },
          { label: '模型加载', color: COLORS.primary, desc: 'GGUF 量化' },
          { label: 'llama.cpp', color: COLORS.green, desc: '单请求推理' },
          { label: '输出', color: COLORS.purple, desc: '逐 token 打印' },
        ]} />
      ),
    },
    {
      title: '可编程管道 (SGLang)',
      content: (
        <Pipeline title="SGLang 请求流程 — 可编程优先" stages={[
          { label: 'DSL 程序', color: COLORS.green, desc: 'gen/fork/join' },
          { label: 'IR 编排', color: COLORS.primary, desc: '执行计划优化' },
          { label: 'RadixAttention', color: COLORS.orange, desc: '前缀缓存复用' },
          { label: 'GPU 推理', color: COLORS.purple, desc: '约束解码' },
          { label: '结构化输出', color: COLORS.green, desc: 'JSON/Schema' },
        ]} />
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
