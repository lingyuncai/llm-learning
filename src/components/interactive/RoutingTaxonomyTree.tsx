import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  summary?: string;
}

const TREE: TreeNode = {
  id: 'root',
  label: 'Model Routing',
  children: [
    {
      id: 'by-granularity',
      label: '按路由粒度',
      children: [
        { id: 'query-level', label: 'Query-level', summary: '整个请求选一个模型。最简单，适用大多数场景。代表：RouteLLM, FrugalGPT。' },
        { id: 'subtask-level', label: 'Subtask-level', summary: '拆分子任务，各自路由。适合复杂 agent 任务。代表：HybridFlow (DAG 路由)。' },
        { id: 'token-level', label: 'Token-level', summary: '生成过程中逐 token 切换模型。最细粒度，额外开销大。代表：Token-level Hybrid (2024)。' },
      ],
    },
    {
      id: 'by-timing',
      label: '按决策时机',
      children: [
        { id: 'static', label: '静态路由', summary: '部署前确定规则。分类器、语义匹配等方法。预测成本低，但无法适应分布漂移。' },
        { id: 'dynamic', label: '动态路由', summary: '运行时持续学习。Bandit / RL 方法。能适应变化，但需要 reward 信号和探索机制。' },
      ],
    },
    {
      id: 'by-usage',
      label: '按模型使用方式',
      children: [
        { id: 'select-one', label: '选一个 (Routing)', summary: '为每个 query 选择一个最合适的模型。最高效，依赖 router 准确性。' },
        { id: 'try-verify', label: '先试后验 (Cascade)', summary: '先用便宜模型，质量不够再升级。无需预判难度，但可能增加延迟。代表：FrugalGPT, AutoMix。' },
        { id: 'use-all', label: '全用 (Ensemble/MoA)', summary: '多模型并行生成，综合最优答案。质量最高，但成本线性增长。代表：Council Mode, MoA。' },
      ],
    },
    {
      id: 'by-router',
      label: '按路由器类型',
      children: [
        { id: 'mf', label: 'Matrix Factorization', summary: '偏好数据学评分函数。RouteLLM 的核心方法之一，用 Chatbot Arena 数据训练。' },
        { id: 'bert', label: 'BERT 分类器', summary: '微调 BERT 做强/弱模型二分类。需要训练数据，但推理成本低。' },
        { id: 'causal-lm', label: 'Causal LM', summary: '用小语言模型（如 Qwen-2.5-3B）做路由判断。语义理解能力强于 BERT。' },
        { id: 'semantic', label: 'Semantic Routing', summary: 'Embedding cosine 匹配，无需训练。最快的路由方式，但粒度粗。' },
        { id: 'self-verify', label: '自验证', summary: '模型评估自己的回答质量。AutoMix 的核心机制。' },
        { id: 'llm-judge', label: 'LLM-as-Judge', summary: '用另一个 LLM 评估回答。比自验证更可靠，但有额外成本。' },
        { id: 'bandit-rl', label: 'Bandit / RL', summary: '在线学习持续优化。ParetoBandit 做 cost-aware 多目标平衡。' },
        { id: 'infra', label: '基础设施级', summary: '负载均衡、fallback、rate-limit。LiteLLM 等工具提供。' },
      ],
    },
  ],
};

export default function RoutingTaxonomyTree() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

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
          路由方法分类体系
        </text>
        <text x="290" y="36" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="10" fill={COLORS.mid}>
          点击分支展开/折叠 · 点击叶节点查看摘要
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
