import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  summary?: string;
}

interface Props {
  locale?: 'zh' | 'en';
}

const createTree = (locale: 'zh' | 'en'): TreeNode => {
  const labels = {
    zh: {
      root: 'Model Routing',
      byGranularity: '按路由粒度',
      queryLevel: 'Query-level',
      querySummary: '整个请求选一个模型。最简单，适用大多数场景。代表：RouteLLM, FrugalGPT。',
      subtaskLevel: 'Subtask-level',
      subtaskSummary: '拆分子任务，各自路由。适合复杂 agent 任务。代表：HybridFlow (DAG 路由)。',
      tokenLevel: 'Token-level',
      tokenSummary: '生成过程中逐 token 切换模型。最细粒度，额外开销大。代表：Token-level Hybrid (2024)。',
      byTiming: '按决策时机',
      static: '静态路由',
      staticSummary: '部署前确定规则。分类器、语义匹配等方法。预测成本低，但无法适应分布漂移。',
      dynamic: '动态路由',
      dynamicSummary: '运行时持续学习。Bandit / RL 方法。能适应变化，但需要 reward 信号和探索机制。',
      byUsage: '按模型使用方式',
      selectOne: '选一个 (Routing)',
      selectOneSummary: '为每个 query 选择一个最合适的模型。最高效，依赖 router 准确性。',
      tryVerify: '先试后验 (Cascade)',
      tryVerifySummary: '先用便宜模型，质量不够再升级。无需预判难度，但可能增加延迟。代表：FrugalGPT, AutoMix。',
      useAll: '全用 (Ensemble/MoA)',
      useAllSummary: '多模型并行生成，综合最优答案。质量最高，但成本线性增长。代表：Council Mode, MoA。',
      byRouter: '按路由器类型',
      mf: 'Matrix Factorization',
      mfSummary: '偏好数据学评分函数。RouteLLM 的核心方法之一，用 Chatbot Arena 数据训练。',
      bert: 'BERT 分类器',
      bertSummary: '微调 BERT 做强/弱模型二分类。需要训练数据，但推理成本低。',
      causalLm: 'Causal LM',
      causalLmSummary: '用小语言模型（如 Qwen-2.5-3B）做路由判断。语义理解能力强于 BERT。',
      semantic: 'Semantic Routing',
      semanticSummary: 'Embedding cosine 匹配，无需训练。最快的路由方式，但粒度粗。',
      selfVerify: '自验证',
      selfVerifySummary: '模型评估自己的回答质量。AutoMix 的核心机制。',
      llmJudge: 'LLM-as-Judge',
      llmJudgeSummary: '用另一个 LLM 评估回答。比自验证更可靠，但有额外成本。',
      banditRl: 'Bandit / RL',
      banditRlSummary: '在线学习持续优化。ParetoBandit 做 cost-aware 多目标平衡。',
      infra: '基础设施级',
      infraSummary: '负载均衡、fallback、rate-limit。LiteLLM 等工具提供。',
    },
    en: {
      root: 'Model Routing',
      byGranularity: 'By Routing Granularity',
      queryLevel: 'Query-level',
      querySummary: 'Select one model for entire request. Simplest, suitable for most scenarios. Examples: RouteLLM, FrugalGPT.',
      subtaskLevel: 'Subtask-level',
      subtaskSummary: 'Split into subtasks, route each independently. Suitable for complex agent tasks. Example: HybridFlow (DAG routing).',
      tokenLevel: 'Token-level',
      tokenSummary: 'Switch models during generation per token. Finest granularity, high overhead. Example: Token-level Hybrid (2024).',
      byTiming: 'By Decision Timing',
      static: 'Static Routing',
      staticSummary: 'Rules determined before deployment. Classifier, semantic matching methods. Low prediction cost, cannot adapt to distribution drift.',
      dynamic: 'Dynamic Routing',
      dynamicSummary: 'Continuous learning at runtime. Bandit / RL methods. Adapts to changes, requires reward signal and exploration.',
      byUsage: 'By Model Usage',
      selectOne: 'Select One (Routing)',
      selectOneSummary: 'Choose one most suitable model per query. Most efficient, depends on router accuracy.',
      tryVerify: 'Try Then Verify (Cascade)',
      tryVerifySummary: 'Try cheap model first, upgrade if quality insufficient. No need to predict difficulty, may increase latency. Examples: FrugalGPT, AutoMix.',
      useAll: 'Use All (Ensemble/MoA)',
      useAllSummary: 'Multiple models generate in parallel, synthesize optimal answer. Highest quality, linear cost growth. Examples: Council Mode, MoA.',
      byRouter: 'By Router Type',
      mf: 'Matrix Factorization',
      mfSummary: 'Learn scoring function from preference data. Core RouteLLM method, trained on Chatbot Arena data.',
      bert: 'BERT Classifier',
      bertSummary: 'Fine-tune BERT for strong/weak model binary classification. Requires training data, low inference cost.',
      causalLm: 'Causal LM',
      causalLmSummary: 'Use small language model (e.g., Qwen-2.5-3B) for routing. Better semantic understanding than BERT.',
      semantic: 'Semantic Routing',
      semanticSummary: 'Embedding cosine matching, no training needed. Fastest routing, coarse granularity.',
      selfVerify: 'Self-Verification',
      selfVerifySummary: 'Model evaluates its own response quality. Core mechanism of AutoMix.',
      llmJudge: 'LLM-as-Judge',
      llmJudgeSummary: 'Use another LLM to evaluate response. More reliable than self-verification, additional cost.',
      banditRl: 'Bandit / RL',
      banditRlSummary: 'Online learning for continuous optimization. ParetoBandit for cost-aware multi-objective balance.',
      infra: 'Infrastructure-Level',
      infraSummary: 'Load balancing, fallback, rate-limit. Provided by tools like LiteLLM.',
    },
  }[locale];

  return {
    id: 'root',
    label: labels.root,
    children: [
      {
        id: 'by-granularity',
        label: labels.byGranularity,
        children: [
          { id: 'query-level', label: labels.queryLevel, summary: labels.querySummary },
          { id: 'subtask-level', label: labels.subtaskLevel, summary: labels.subtaskSummary },
          { id: 'token-level', label: labels.tokenLevel, summary: labels.tokenSummary },
        ],
      },
      {
        id: 'by-timing',
        label: labels.byTiming,
        children: [
          { id: 'static', label: labels.static, summary: labels.staticSummary },
          { id: 'dynamic', label: labels.dynamic, summary: labels.dynamicSummary },
        ],
      },
      {
        id: 'by-usage',
        label: labels.byUsage,
        children: [
          { id: 'select-one', label: labels.selectOne, summary: labels.selectOneSummary },
          { id: 'try-verify', label: labels.tryVerify, summary: labels.tryVerifySummary },
          { id: 'use-all', label: labels.useAll, summary: labels.useAllSummary },
        ],
      },
      {
        id: 'by-router',
        label: labels.byRouter,
        children: [
          { id: 'mf', label: labels.mf, summary: labels.mfSummary },
          { id: 'bert', label: labels.bert, summary: labels.bertSummary },
          { id: 'causal-lm', label: labels.causalLm, summary: labels.causalLmSummary },
          { id: 'semantic', label: labels.semantic, summary: labels.semanticSummary },
          { id: 'self-verify', label: labels.selfVerify, summary: labels.selfVerifySummary },
          { id: 'llm-judge', label: labels.llmJudge, summary: labels.llmJudgeSummary },
          { id: 'bandit-rl', label: labels.banditRl, summary: labels.banditRlSummary },
          { id: 'infra', label: labels.infra, summary: labels.infraSummary },
        ],
      },
    ],
  };
};

export default function RoutingTaxonomyTree({ locale = 'zh' }: Props) {
  const TREE = createTree(locale);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const t = {
    zh: {
      title: '路由方法分类体系',
      instruction: '点击分支展开/折叠 · 点击叶节点查看摘要',
    },
    en: {
      title: 'Routing Method Taxonomy',
      instruction: 'Click branches to expand/collapse · Click leaves for summary',
    },
  }[locale];

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderNode = (node: TreeNode, depth: number, yRef: { y: number }): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    const x = 30 + depth * 28;
    const y = yRef.y;
    const isLeaf = !node.children;
    const isExpanded = expanded.has(node.id);
    const hasChildren = !!node.children && node.children.length > 0;

    // Toggle icon for branches
    if (hasChildren) {
      elements.push(
        <text key={`icon-${node.id}`} x={x - 16} y={y + 5}
              fontFamily={FONTS.mono} fontSize="14" fill={COLORS.primary}
              style={{ cursor: 'pointer' }} onClick={() => toggle(node.id)}>
          {isExpanded ? '▾' : '▸'}
        </text>
      );
    }

    // Node label
    elements.push(
      <text key={`label-${node.id}`} x={x} y={y + 5}
            fontFamily={FONTS.sans} fontSize={depth === 0 ? "14" : "12"}
            fontWeight={depth === 0 ? "700" : isLeaf ? "400" : "600"}
            fill={isLeaf ? COLORS.primary : COLORS.dark}
            style={{ cursor: isLeaf ? 'pointer' : hasChildren ? 'pointer' : 'default' }}
            onClick={() => {
              if (isLeaf && node.summary) {
                setSelectedSummary(node.summary);
                setSelectedLabel(node.label);
              } else if (hasChildren) {
                toggle(node.id);
              }
            }}>
        {node.label}
      </text>
    );

    yRef.y += 24;

    // Recurse children if expanded
    if (hasChildren && isExpanded) {
      for (const child of node.children!) {
        elements.push(...renderNode(child, depth + 1, yRef));
      }
    }

    return elements;
  };

  // Pre-calculate height
  const calcHeight = (node: TreeNode): number => {
    let h = 24;
    if (node.children && expanded.has(node.id)) {
      for (const child of node.children) h += calcHeight(child);
    }
    return h;
  };

  const treeH = calcHeight(TREE);
  const summaryH = selectedSummary ? 60 : 0;
  const totalH = treeH + 40 + summaryH + 20;
  const yRef = { y: 40 };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 580 ${totalH}`} className="w-full">
        <text x="290" y="22" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x="290" y="36" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          {t.instruction}
        </text>

        {renderNode(TREE, 0, yRef)}

        {/* Summary box */}
        {selectedSummary && (
          <g transform={`translate(30, ${treeH + 45})`}>
            <rect x="0" y="0" width="520" height="50" rx="4"
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth="1.5" />
            <text x="10" y="18" fontFamily={FONTS.sans} fontSize="12"
                  fontWeight="600" fill={COLORS.primary}>
              {selectedLabel}
            </text>
            <text x="10" y="36" fontFamily={FONTS.sans} fontSize="11"
                  fill={COLORS.dark}>
              {selectedSummary.length > 80 ? selectedSummary.slice(0, 80) + '…' : selectedSummary}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
