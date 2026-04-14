import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './shared/colors';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface I18nText { zh: string; en: string }

interface Option {
  label: I18nText;
  value: string;
}

interface Question {
  id: string;
  text: I18nText;
  options: Option[];
  /** Show this question only when a previous answer matches */
  condition?: { questionId: string; values: string[] };
}

interface Recommendation {
  benchmarks: string[];
  modelRange: I18nText;
  rationale: I18nText;
  nextPath?: { label: I18nText; href: string };
}

/* ------------------------------------------------------------------ */
/*  Questions                                                          */
/* ------------------------------------------------------------------ */

const QUESTIONS: Question[] = [
  {
    id: 'task',
    text: { zh: '你的核心任务是什么？', en: 'What is your core task?' },
    options: [
      { label: { zh: '对话 / 问答', en: 'Chat / QA' }, value: 'chat' },
      { label: { zh: '代码生成 / 辅助', en: 'Code Generation' }, value: 'code' },
      { label: { zh: '推理 / 数学', en: 'Reasoning / Math' }, value: 'reasoning' },
      { label: { zh: 'Agent / 工具调用', en: 'Agent / Tool Use' }, value: 'agent' },
    ],
  },
  {
    id: 'latency',
    text: { zh: '延迟要求？', en: 'Latency requirements?' },
    options: [
      { label: { zh: '实时 (<1s)', en: 'Real-time (<1s)' }, value: 'realtime' },
      { label: { zh: '交互式 (1-10s)', en: 'Interactive (1-10s)' }, value: 'interactive' },
      { label: { zh: '批处理 (无限制)', en: 'Batch (no limit)' }, value: 'batch' },
    ],
  },
  {
    id: 'deployment',
    text: { zh: '部署方式？', en: 'Deployment method?' },
    options: [
      { label: { zh: '云端 API', en: 'Cloud API' }, value: 'cloud' },
      { label: { zh: '本地部署', en: 'Local Deployment' }, value: 'local' },
      { label: { zh: '混合 (大小模型协同)', en: 'Hybrid (large + small)' }, value: 'hybrid' },
    ],
  },
  {
    id: 'hardware',
    text: { zh: '本地硬件配置？', en: 'Local hardware?' },
    condition: { questionId: 'deployment', values: ['local', 'hybrid'] },
    options: [
      { label: { zh: 'NVIDIA GPU (≥16 GB)', en: 'NVIDIA GPU (≥16 GB)' }, value: 'nvidia-gpu' },
      { label: { zh: 'NVIDIA GPU (8-12 GB)', en: 'NVIDIA GPU (8-12 GB)' }, value: 'nvidia-gpu-small' },
      { label: { zh: 'Intel Arc / iGPU', en: 'Intel Arc / iGPU' }, value: 'intel-gpu' },
      { label: { zh: '仅 CPU', en: 'CPU Only' }, value: 'cpu-only' },
      { label: { zh: 'Apple Silicon', en: 'Apple Silicon' }, value: 'apple' },
    ],
  },
  {
    id: 'budget',
    text: { zh: '月度 API 预算？', en: 'Monthly API budget?' },
    condition: { questionId: 'deployment', values: ['cloud', 'hybrid'] },
    options: [
      { label: { zh: '不限', en: 'Unlimited' }, value: 'unlimited' },
      { label: { zh: '$100-500 / 月', en: '$100-500 / mo' }, value: 'medium' },
      { label: { zh: '<$100 / 月', en: '<$100 / mo' }, value: 'low' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Decision logic                                                     */
/* ------------------------------------------------------------------ */

function getRecommendation(
  answers: Record<string, string>,
  locale: 'zh' | 'en',
): Recommendation {
  const { task, latency, deployment, hardware, budget } = answers;

  // --- Benchmarks by task ---
  const benchmarkMap: Record<string, string[]> = {
    chat: ['Chatbot Arena (ELO)', 'MT-Bench', 'AlpacaEval 2.0'],
    code: ['SWE-bench Verified', 'HumanEval / HumanEval+', 'LiveCodeBench'],
    reasoning: ['MMLU-Pro', 'GPQA Diamond', 'MATH-500', 'GSM8K'],
    agent: ['BFCL v3', 'WebArena / VisualWebArena', 'GAIA'],
  };
  const benchmarks = [...(benchmarkMap[task] || benchmarkMap.chat)];

  // Latency modifier — add TTFT benchmark for realtime + cloud
  if (latency === 'realtime' && (deployment === 'cloud' || deployment === 'hybrid')) {
    benchmarks.push('Artificial Analysis TTFT');
  }

  // --- Model range ---
  const modelParts: string[] = [];
  const tips: string[] = [];

  if (deployment === 'cloud') {
    if (budget === 'low') {
      modelParts.push(
        locale === 'zh'
          ? '轻量 API：GPT-4o-mini / Gemini Flash / Claude Haiku'
          : 'Lightweight APIs: GPT-4o-mini / Gemini Flash / Claude Haiku',
      );
      tips.push(locale === 'zh' ? '💰 低预算优先选择轻量 API，按 token 计费更经济' : '💰 Low budget: prefer lightweight APIs for token-based billing');
    } else if (budget === 'medium') {
      modelParts.push(
        locale === 'zh'
          ? '中端 API：GPT-4o / Claude Sonnet / Gemini Pro'
          : 'Mid-tier APIs: GPT-4o / Claude Sonnet / Gemini Pro',
      );
    } else {
      modelParts.push(
        locale === 'zh'
          ? '旗舰 API：GPT-4o / o3 / Claude Opus / Gemini 2.5 Pro'
          : 'Flagship APIs: GPT-4o / o3 / Claude Opus / Gemini 2.5 Pro',
      );
    }
  } else if (deployment === 'local') {
    if (hardware === 'nvidia-gpu') {
      modelParts.push(
        locale === 'zh'
          ? '13B-70B (FP16/INT8)：Qwen2.5-72B / Llama 3.3-70B / Mixtral 8x7B'
          : '13B-70B (FP16/INT8): Qwen2.5-72B / Llama 3.3-70B / Mixtral 8x7B',
      );
    } else if (hardware === 'nvidia-gpu-small') {
      modelParts.push(
        locale === 'zh'
          ? '7B-13B (INT4/INT8)：Qwen2.5-7B / Gemma 2-9B / Phi-4 / Llama 3.1-8B'
          : '7B-13B (INT4/INT8): Qwen2.5-7B / Gemma 2-9B / Phi-4 / Llama 3.1-8B',
      );
    } else if (hardware === 'intel-gpu') {
      modelParts.push(
        locale === 'zh'
          ? '7B-13B (INT4 via OpenVINO)：Phi-4 / Qwen2.5-7B / Llama 3.1-8B'
          : '7B-13B (INT4 via OpenVINO): Phi-4 / Qwen2.5-7B / Llama 3.1-8B',
      );
      tips.push(locale === 'zh' ? '见 intel-igpu-inference 路径了解 OpenVINO 优化细节' : 'See intel-igpu-inference path for OpenVINO optimization details');
    } else if (hardware === 'apple') {
      modelParts.push(
        locale === 'zh'
          ? '7B-13B (MLX / llama.cpp)：Llama 3.1-8B / Gemma 2-9B / Phi-4'
          : '7B-13B (MLX / llama.cpp): Llama 3.1-8B / Gemma 2-9B / Phi-4',
      );
    } else {
      modelParts.push(
        locale === 'zh'
          ? '1B-3B (INT4 GGUF)：Phi-3.5-mini / Qwen2.5-1.5B / SmolLM2'
          : '1B-3B (INT4 GGUF): Phi-3.5-mini / Qwen2.5-1.5B / SmolLM2',
      );
    }
  } else {
    /* hybrid */
    if (budget === 'low') {
      modelParts.push(
        locale === 'zh'
          ? '本地优先 + 低成本 API 兜底：本地 7B + GPT-4o-mini fallback'
          : 'Local-first + low-cost API fallback: local 7B + GPT-4o-mini fallback',
      );
      tips.push(locale === 'zh' ? '💰 本地处理简单请求，API 仅处理复杂 query' : '💰 Handle simple requests locally, API only for complex queries');
    } else {
      modelParts.push(
        locale === 'zh'
          ? '本地 7B-13B + 云端旗舰协同：Qwen2.5-7B 本地 + Claude Sonnet 云端'
          : 'Local 7B-13B + cloud flagship: Qwen2.5-7B local + Claude Sonnet cloud',
      );
    }
  }

  // Latency modifier for local realtime
  if (latency === 'realtime' && (deployment === 'local' || deployment === 'hybrid')) {
    tips.push(
      locale === 'zh'
        ? '⚡ 实时延迟要求：优先选择较小模型 + 高度量化 (INT4)，牺牲少量精度换取速度'
        : '⚡ Real-time latency: prefer smaller models + aggressive quantization (INT4)',
    );
  }

  // Build rationale
  const rationale =
    locale === 'zh'
      ? [
          `任务类型「${task}」对应的核心 benchmark 已列出。`,
          ...modelParts,
          ...tips,
          '建议用以上 benchmark 组合做一轮 mini evaluation 确认最终选择。',
        ].join('\n')
      : [
          `Core benchmarks for task "${task}" are listed above.`,
          ...modelParts,
          ...tips,
          'Run a mini evaluation with the benchmark combination above to confirm your choice.',
        ].join('\n');

  // Next path for hybrid
  const nextPath =
    deployment === 'hybrid'
      ? {
          label: {
            zh: '继续阅读 → Model Routing 路径：从"选一个"到"动态选"',
            en: 'Continue → Model Routing path: from "pick one" to "dynamic routing"',
          },
          href: '/zh/paths/model-routing',
        }
      : undefined;

  return {
    benchmarks,
    modelRange: { zh: modelParts.join('；'), en: modelParts.join('; ') },
    rationale: { zh: rationale, en: rationale },
    nextPath,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ModelSelectionDecisionTree({
  locale = 'zh',
}: {
  locale?: 'zh' | 'en';
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [done, setDone] = useState(false);

  const t = locale === 'zh'
    ? {
        title: '模型选型决策树',
        subtitle: '回答几个问题，获取个性化推荐',
        reset: '重新选择',
        benchmarkTitle: '推荐 Benchmark 组合',
        modelTitle: '推荐模型范围',
        rationaleTitle: '选型建议',
        stepOf: (n: number, total: number) => `第 ${n} 步 / 共 ${total} 步`,
      }
    : {
        title: 'Model Selection Decision Tree',
        subtitle: 'Answer a few questions for personalized recommendations',
        reset: 'Start Over',
        benchmarkTitle: 'Recommended Benchmarks',
        modelTitle: 'Recommended Model Range',
        rationaleTitle: 'Selection Rationale',
        stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
      };

  // Compute the active question sequence based on current answers
  const activeQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => {
      if (!q.condition) return true;
      const prev = answers[q.condition.questionId];
      return prev != null && q.condition.values.includes(prev);
    });
  }, [answers]);

  const totalSteps = activeQuestions.length;
  const currentQuestion = activeQuestions[currentIdx];

  const handleSelect = (value: string) => {
    const qId = currentQuestion.id;
    const next = { ...answers, [qId]: value };
    setAnswers(next);
    setDirection(1);

    // Recompute active list with the new answer to decide if we're done
    const nextActive = QUESTIONS.filter((q) => {
      if (!q.condition) return true;
      const prev = next[q.condition.questionId];
      return prev != null && q.condition.values.includes(prev);
    });

    if (currentIdx + 1 >= nextActive.length) {
      setDone(true);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrentIdx(0);
    setDone(false);
    setDirection(-1);
  };

  const recommendation = useMemo(
    () => (done ? getRecommendation(answers, locale) : null),
    [done, answers, locale],
  );

  // Breadcrumb of previous answers
  const breadcrumbs = activeQuestions
    .slice(0, currentIdx)
    .map((q) => ({
      question: q.text[locale],
      answer:
        q.options.find((o) => o.value === answers[q.id])?.label[locale] ?? '',
    }));

  const progressPct = done
    ? 100
    : totalSteps > 0
      ? ((currentIdx) / totalSteps) * 100
      : 0;

  return (
    <div className="my-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h3
          className="text-base font-bold m-0"
          style={{ color: COLORS.dark }}
        >
          {t.title}
        </h3>
        <p className="text-xs mt-0.5 mb-0" style={{ color: COLORS.mid }}>
          {t.subtitle}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 relative">
        <motion.div
          className="h-full rounded-r"
          style={{ backgroundColor: COLORS.primary }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      <div className="px-5 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {breadcrumbs.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center text-xs px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: COLORS.valid,
                  color: COLORS.primary,
                }}
              >
                {b.answer}
              </span>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {!done && currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step indicator */}
              <p
                className="text-xs font-medium mb-1"
                style={{ color: COLORS.mid }}
              >
                {t.stepOf(currentIdx + 1, totalSteps)}
              </p>

              {/* Question */}
              <p
                className="text-lg font-semibold mb-4"
                style={{ color: COLORS.dark }}
              >
                {currentQuestion.text[locale]}
              </p>

              {/* Options */}
              <div className="grid gap-2 sm:grid-cols-2">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="text-left px-4 py-3 rounded-lg border-2 transition-all duration-150 hover:shadow-md cursor-pointer"
                    style={{
                      borderColor: COLORS.light,
                      backgroundColor: COLORS.bgAlt,
                      color: COLORS.dark,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = COLORS.primary;
                      e.currentTarget.style.backgroundColor = COLORS.valid;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = COLORS.light;
                      e.currentTarget.style.backgroundColor = COLORS.bgAlt;
                    }}
                  >
                    <span className="text-sm font-medium">
                      {opt.label[locale]}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : done && recommendation ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Benchmark list */}
              <div className="mb-4">
                <h4
                  className="text-sm font-bold mb-2"
                  style={{ color: COLORS.primary }}
                >
                  {t.benchmarkTitle}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.benchmarks.map((b) => (
                    <span
                      key={b}
                      className="inline-block text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: COLORS.highlight,
                        color: COLORS.dark,
                      }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Model range */}
              <div className="mb-4">
                <h4
                  className="text-sm font-bold mb-2"
                  style={{ color: COLORS.green }}
                >
                  {t.modelTitle}
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: COLORS.dark }}
                >
                  {recommendation.modelRange[locale]}
                </p>
              </div>

              {/* Rationale */}
              <div
                className="rounded-lg p-4 mb-4"
                style={{ backgroundColor: COLORS.bgAlt }}
              >
                <h4
                  className="text-sm font-bold mb-2"
                  style={{ color: COLORS.orange }}
                >
                  {t.rationaleTitle}
                </h4>
                <p
                  className="text-sm leading-relaxed whitespace-pre-line m-0"
                  style={{ color: COLORS.dark }}
                >
                  {recommendation.rationale[locale]}
                </p>
              </div>

              {/* Next path link */}
              {recommendation.nextPath && (
                <a
                  href={recommendation.nextPath.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 no-underline"
                  style={{ color: COLORS.primary }}
                >
                  {recommendation.nextPath.label[locale]} →
                </a>
              )}

              {/* Reset */}
              <div className="mt-2">
                <button
                  onClick={reset}
                  className="text-sm px-4 py-2 rounded-lg border cursor-pointer transition-colors duration-150"
                  style={{
                    borderColor: COLORS.light,
                    color: COLORS.mid,
                    backgroundColor: COLORS.bg,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.bgAlt;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.bg;
                  }}
                >
                  {t.reset}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
