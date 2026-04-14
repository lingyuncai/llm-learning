// src/components/interactive/CodeBenchmarkEvolution.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface BenchmarkNode {
  id: string;
  name: string;
  year: number;
  evalMethod: { zh: string; en: string };
  sota: string;
  innovation: { zh: string; en: string };
  details: { zh: string; en: string };
  parentIds: string[];
}

// SOTA data verified 2026-04:
// HumanEval pass@1 >90%: GPT-4o/Claude 3.5 class (EvalPlus leaderboard)
// MBPP pass@1 >85%: similar class models (EvalPlus leaderboard)
// HumanEval+ pass@1 ~85-92%: confirmed ~80x test cases (EvalPlus paper, arxiv 2305.01210)
// SWE-bench Verified ~76.8%: Claude 4.5 Opus (swebench.com, 2026-02)
// SWE-bench full ~50%: top agents (swebench.com)
// LiveCodeBench pass@1 ~60-70%: top models (livecodebench.github.io)
// BigCodeBench pass@1 ~60-65%: top models, 1140 tasks (bigcode-bench.github.io)
const NODES: BenchmarkNode[] = [
  { id: 'humaneval', name: 'HumanEval', year: 2021,
    evalMethod: { zh: '执行验证 (pass@k)', en: 'Execution (pass@k)' },
    sota: 'pass@1 >90%',
    innovation: { zh: '定义了 pass@k 范式', en: 'Defined pass@k paradigm' },
    details: { zh: '164 个 Python 函数补全题，OpenAI 2021', en: '164 Python function completions, OpenAI 2021' },
    parentIds: [] },
  { id: 'mbpp', name: 'MBPP', year: 2021,
    evalMethod: { zh: '执行验证', en: 'Execution' },
    sota: 'pass@1 >85%',
    innovation: { zh: '更广覆盖 (974 题)', en: 'Broader coverage (974 problems)' },
    details: { zh: 'Google 2021，974 个 Python 入门题', en: 'Google 2021, 974 Python beginner problems' },
    parentIds: [] },
  { id: 'humaneval-plus', name: 'HumanEval+', year: 2023,
    evalMethod: { zh: '增强执行验证', en: 'Enhanced execution' },
    sota: 'pass@1 ~85%',
    innovation: { zh: '~80x 测试用例，暴露假阳性', en: '~80x test cases, exposes false positives' },
    details: { zh: 'EvalPlus 项目，大幅增加测试用例', en: 'EvalPlus project, massively increased test cases' },
    parentIds: ['humaneval'] },
  { id: 'swe-bench', name: 'SWE-bench', year: 2024,
    evalMethod: { zh: '真实 repo 测试验证', en: 'Real repo test validation' },
    sota: 'resolved ~50%',
    innovation: { zh: '从函数补全到真实 issue 修复', en: 'From function completion to real issue fixing' },
    details: { zh: 'Princeton 2024，2294 个真实 GitHub issue 修复', en: 'Princeton 2024, 2294 real GitHub issue fixes' },
    parentIds: [] },
  { id: 'swe-bench-verified', name: 'SWE-bench Verified', year: 2024,
    evalMethod: { zh: '人工验证子集', en: 'Human-verified subset' },
    sota: 'resolved ~77%',
    innovation: { zh: '最权威报告标准', en: 'Most authoritative reporting standard' },
    details: { zh: '500 题人工验证的高质量子集', en: '500 human-verified high-quality subset' },
    parentIds: ['swe-bench'] },
  { id: 'livecodebench', name: 'LiveCodeBench', year: 2024,
    evalMethod: { zh: '执行验证 + 动态更新', en: 'Execution + dynamic updates' },
    sota: 'pass@1 ~65%',
    innovation: { zh: '持续引入新竞赛题，抗 contamination', en: 'Continuously adds new competition problems, anti-contamination' },
    details: { zh: '从 LeetCode/Codeforces 等持续引入新题', en: 'Continuously imports from LeetCode/Codeforces' },
    parentIds: [] },
  { id: 'bigcodebench', name: 'BigCodeBench', year: 2024,
    evalMethod: { zh: '执行验证', en: 'Execution' },
    sota: 'pass@1 ~62%',
    innovation: { zh: '复杂库调用和 API 场景', en: 'Complex library calls and API scenarios' },
    details: { zh: '1140 个真实 API 使用场景，覆盖 139 个 Python 库', en: '1140 real API tasks, covers 139 Python libraries' },
    parentIds: ['mbpp'] },
];

const W = 700;
const H = 380;
const PAD = { top: 50, right: 30, bottom: 60, left: 30 };
const TIMELINE_Y = 160;
const YEAR_MIN = 2020.5;
const YEAR_MAX = 2025;

const xScale = (year: number) =>
  PAD.left + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (W - PAD.left - PAD.right);

// Stagger nodes vertically to avoid overlap
const Y_OFFSETS: Record<string, number> = {
  'humaneval': -55,
  'mbpp': 55,
  'humaneval-plus': -55,
  'swe-bench': 55,
  'swe-bench-verified': -55,
  'livecodebench': -55,
  'bigcodebench': 55,
};

export default function CodeBenchmarkEvolution({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [selected, setSelected] = useState<string | null>(null);

  const years = [2021, 2022, 2023, 2024, 2025];
  const nodeW = 120;
  const nodeH = 42;

  const getNodePos = (node: BenchmarkNode) => ({
    cx: xScale(node.year),
    cy: TIMELINE_Y + (Y_OFFSETS[node.id] || 0),
  });

  const selectedNode = NODES.find(n => n.id === selected);

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark }}>
          {t('代码 Benchmark 演进时间线', 'Code Benchmark Evolution Timeline')}
        </span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: COLORS.mid }}>
          {t('点击节点查看详情，连线表示继承关系', 'Click nodes for details, lines show inheritance')}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <marker id="arrow-evo" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={COLORS.primary} opacity={0.5} />
          </marker>
          <filter id="shadow-evo" x="-5%" y="-5%" width="115%" height="115%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Timeline base line */}
        <line
          x1={PAD.left} x2={W - PAD.right}
          y1={TIMELINE_Y} y2={TIMELINE_Y}
          stroke={COLORS.light} strokeWidth={2}
        />

        {/* Year markers */}
        {years.map(year => {
          const x = xScale(year);
          return (
            <g key={year}>
              <line x1={x} x2={x} y1={TIMELINE_Y - 8} y2={TIMELINE_Y + 8}
                stroke={COLORS.mid} strokeWidth={1.5} />
              <text x={x} y={TIMELINE_Y + 24} textAnchor="middle"
                fontSize={12} fontWeight={600} fill={COLORS.dark} fontFamily={FONTS.mono}>
                {year}
              </text>
            </g>
          );
        })}

        {/* Connection lines (parent → child) */}
        {NODES.map(node => {
          if (node.parentIds.length === 0) return null;
          return node.parentIds.map(pid => {
            const parent = NODES.find(n => n.id === pid);
            if (!parent) return null;
            const from = getNodePos(parent);
            const to = getNodePos(node);
            const isHighlighted = selected === node.id || selected === pid;
            return (
              <line
                key={`${pid}-${node.id}`}
                x1={from.cx + nodeW / 2 - 4}
                y1={from.cy}
                x2={to.cx - nodeW / 2 + 4}
                y2={to.cy}
                stroke={isHighlighted ? COLORS.primary : COLORS.mid}
                strokeWidth={isHighlighted ? 2 : 1.2}
                strokeDasharray={isHighlighted ? 'none' : '5,4'}
                opacity={isHighlighted ? 0.8 : 0.4}
                markerEnd="url(#arrow-evo)"
              />
            );
          });
        })}

        {/* Nodes */}
        {NODES.map(node => {
          const pos = getNodePos(node);
          const isSelected = selected === node.id;
          const isSaturated = node.sota.includes('>90') || node.sota.includes('>85');
          const bgColor = isSelected ? COLORS.primary + '15' : isSaturated ? COLORS.masked : '#fff';
          const borderColor = isSelected ? COLORS.primary : isSaturated ? COLORS.mid : COLORS.primary;

          return (
            <g key={node.id}
              onClick={() => setSelected(isSelected ? null : node.id)}
              style={{ cursor: 'pointer' }}>
              <motion.rect
                x={pos.cx - nodeW / 2}
                y={pos.cy - nodeH / 2}
                width={nodeW}
                height={nodeH}
                rx={8}
                fill={bgColor}
                stroke={borderColor}
                strokeWidth={isSelected ? 2.5 : 1.5}
                filter="url(#shadow-evo)"
                animate={{ scale: isSelected ? 1.05 : 1 }}
                transition={{ duration: 0.15 }}
                style={{ transformOrigin: `${pos.cx}px ${pos.cy}px` }}
              />
              <text
                x={pos.cx} y={pos.cy - 4}
                textAnchor="middle" fontSize={11} fontWeight={700}
                fill={isSelected ? COLORS.primary : COLORS.dark}
                fontFamily={FONTS.sans}
                style={{ pointerEvents: 'none' }}>
                {node.name}
              </text>
              <text
                x={pos.cx} y={pos.cy + 11}
                textAnchor="middle" fontSize={9}
                fill={COLORS.mid}
                fontFamily={FONTS.mono}
                style={{ pointerEvents: 'none' }}>
                {node.sota}
              </text>
              {/* Vertical connector to timeline */}
              <line
                x1={pos.cx} x2={pos.cx}
                y1={pos.cy + (Y_OFFSETS[node.id] > 0 ? -nodeH / 2 : nodeH / 2)}
                y2={TIMELINE_Y}
                stroke={COLORS.light} strokeWidth={1}
                strokeDasharray="3,3"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}

        {/* Detail panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <rect x={PAD.left + 10} y={H - PAD.bottom - 80}
                width={W - PAD.left - PAD.right - 20} height={74}
                rx={8} fill="#fff" stroke={COLORS.primary} strokeWidth={1.5}
                filter="url(#shadow-evo)" />
              <text x={PAD.left + 24} y={H - PAD.bottom - 58}
                fontSize={13} fontWeight={700} fill={COLORS.primary} fontFamily={FONTS.sans}>
                {selectedNode.name}
              </text>
              <text x={PAD.left + 24} y={H - PAD.bottom - 42}
                fontSize={10} fill={COLORS.dark} fontFamily={FONTS.sans}>
                {selectedNode.details[locale]}
              </text>
              <text x={PAD.left + 24} y={H - PAD.bottom - 27}
                fontSize={10} fill={COLORS.mid} fontFamily={FONTS.sans}>
                {t('评估', 'Eval')}: {selectedNode.evalMethod[locale]}　|　SOTA: {selectedNode.sota}
              </text>
              <text x={PAD.left + 24} y={H - PAD.bottom - 12}
                fontSize={10} fontWeight={600} fill={COLORS.orange} fontFamily={FONTS.sans}>
                {t('创新点', 'Innovation')}: {selectedNode.innovation[locale]}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
