// src/components/interactive/BenchmarkTaxonomy.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type Category = 'knowledge' | 'reasoning' | 'code' | 'agent' | 'preference';
type EvalMethod = 'exact_match' | 'execution' | 'llm_judge' | 'human_eval' | 'elo';
type UpdateStrategy = 'static' | 'dynamic';

interface Benchmark {
  name: string;
  year: number;
  category: Category;
  evalMethod: EvalMethod;
  updateStrategy: UpdateStrategy;
  datasetSize: string;
  sotaRange: string;
  description: { zh: string; en: string };
  keyFeature: { zh: string; en: string };
}

const BENCHMARKS: Benchmark[] = [
  // Knowledge
  { name: 'MMLU', year: 2021, category: 'knowledge', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '~15,908 (57 subjects)', sotaRange: '88–90%',
    description: { zh: '大规模多任务语言理解，覆盖 57 个学科从 STEM 到人文', en: 'Massive Multitask Language Understanding across 57 subjects from STEM to humanities' },
    keyFeature: { zh: '最广泛引用的知识基准，但存在噪声题目', en: 'Most widely cited knowledge benchmark, but contains noisy questions' } },
  { name: 'MMLU-Pro', year: 2024, category: 'knowledge', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '~12,032 (10 choices)', sotaRange: '72–78%',
    description: { zh: 'MMLU 升级版，10 选项、更强推理需求、去除噪声题', en: 'MMLU upgrade: 10 options, stronger reasoning, noise removed' },
    keyFeature: { zh: '选项从 4 扩到 10，prompt 敏感性从 4-5% 降至 2%', en: 'Options expanded 4→10, prompt sensitivity reduced from 4-5% to 2%' } },
  // Reasoning
  { name: 'GSM8K', year: 2021, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '~8,500 (1,319 test)', sotaRange: '95–97%',
    description: { zh: '小学数学应用题，需要 2-8 步推理', en: 'Grade school math word problems requiring 2-8 step reasoning' },
    keyFeature: { zh: '推理能力入门基准，顶级模型已接近饱和', en: 'Entry-level reasoning benchmark, top models near saturation' } },
  { name: 'MATH / MATH-500', year: 2021, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '12,500 (5,000 test; MATH-500 is 500 subset)', sotaRange: '85–95%',
    description: { zh: '高中到竞赛级数学，覆盖代数、几何、数论等 7 个领域', en: 'High school to competition math across 7 areas: algebra, geometry, number theory, etc.' },
    keyFeature: { zh: 'MATH-500 是常用子集，难度分 1-5 级', en: 'MATH-500 is the commonly used subset, difficulty levels 1-5' } },
  { name: 'AIME 2024', year: 2024, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '30 (2 sets × 15)', sotaRange: '50–87%',
    description: { zh: '美国数学邀请赛真题，高难度竞赛数学', en: 'American Invitational Mathematics Exam, high-difficulty competition math' },
    keyFeature: { zh: '答案为 0-999 整数，天然防猜测', en: 'Answers are integers 0-999, naturally guess-proof' } },
  { name: 'BBH', year: 2022, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '~6,511 (23 tasks)', sotaRange: '85–95%',
    description: { zh: 'BIG-Bench Hard：从 BIG-Bench 中筛选出 LM 低于人类水平的 23 个难任务', en: 'BIG-Bench Hard: 23 tasks where LMs scored below average human raters' },
    keyFeature: { zh: 'CoT prompting 可大幅提升表现', en: 'CoT prompting dramatically improves performance' } },
  { name: 'GPQA Diamond', year: 2023, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '198 (Diamond subset)', sotaRange: '55–75%',
    description: { zh: 'Graduate-Level Google-Proof Q&A，博士级别的物理/化学/生物问题', en: 'Graduate-Level Google-Proof Q&A: PhD-level physics/chemistry/biology' },
    keyFeature: { zh: '领域专家准确率 74%，非专家搜索 30 分钟仅 34%', en: 'Domain experts: 74% accuracy; non-experts with Google: only 34%' } },
  { name: 'FrontierMath', year: 2024, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '~hundreds (unpublished)', sotaRange: '<2%',
    description: { zh: '前沿数学研究问题，由数学家出题并审核', en: 'Frontier math research problems, crafted and vetted by mathematicians' },
    keyFeature: { zh: '当前 SOTA <2%，专家需数小时到数天解题', en: 'Current SOTA <2%; experts need hours to days per problem' } },
  { name: 'ARC-Challenge', year: 2018, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '2,590 (Challenge set)', sotaRange: '92–96%',
    description: { zh: 'AI2 推理挑战：小学科学选择题中检索和统计方法难以解决的子集', en: 'AI2 Reasoning Challenge: grade-school science questions hard for retrieval/statistical methods' },
    keyFeature: { zh: '早期推理基准，现在主要用作基线对比', en: 'Early reasoning benchmark, now mainly used as baseline comparison' } },
  { name: 'HellaSwag', year: 2019, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '~10,042 (validation)', sotaRange: '95–98%',
    description: { zh: '常识推理：给定场景选择最合理的后续描述', en: 'Commonsense reasoning: choose the most plausible continuation of a scenario' },
    keyFeature: { zh: '通过 Adversarial Filtering 生成，人类准确率 95%+', en: 'Generated via Adversarial Filtering; human accuracy 95%+' } },
  // Code
  { name: 'HumanEval', year: 2021, category: 'code', evalMethod: 'execution', updateStrategy: 'static',
    datasetSize: '164 problems', sotaRange: '90–97%',
    description: { zh: 'OpenAI 提出的函数级代码生成基准，包含 docstring + 测试用例', en: 'OpenAI function-level code generation benchmark with docstring + test cases' },
    keyFeature: { zh: '开创了 pass@k 评估范式，但题量小、已近饱和', en: 'Pioneered pass@k evaluation paradigm, but small and near saturation' } },
  { name: 'HumanEval+', year: 2023, category: 'code', evalMethod: 'execution', updateStrategy: 'static',
    datasetSize: '164 (80x more tests)', sotaRange: '85–92%',
    description: { zh: '增强测试用例版 HumanEval，同样 164 题但每题增加约 80 倍测试', en: 'Enhanced HumanEval with ~80x more test cases per problem' },
    keyFeature: { zh: '揭示原版 HumanEval 高分可能是虚假通过', en: 'Reveals original HumanEval high scores may be false passes' } },
  { name: 'SWE-bench', year: 2024, category: 'code', evalMethod: 'execution', updateStrategy: 'static',
    datasetSize: '2,294 instances (500 Verified)', sotaRange: '55–77% (Verified)',
    description: { zh: '基于真实 GitHub Issue 的端到端软件工程任务', en: 'End-to-end software engineering tasks from real GitHub issues' },
    keyFeature: { zh: '需要跨文件理解和修改，最接近真实开发场景', en: 'Requires cross-file understanding and modification, closest to real dev' } },
  { name: 'LiveCodeBench', year: 2024, category: 'code', evalMethod: 'execution', updateStrategy: 'dynamic',
    datasetSize: '400+ (持续更新)', sotaRange: '50–75%',
    description: { zh: '从 LeetCode/AtCoder/Codeforces 持续收集新题，防止数据污染', en: 'Continuously collects new problems from LeetCode/AtCoder/Codeforces to prevent contamination' },
    keyFeature: { zh: '动态更新的代码基准，还评估 self-repair 和 test output prediction', en: 'Dynamic code benchmark; also evaluates self-repair and test output prediction' } },
  { name: 'BigCodeBench', year: 2024, category: 'code', evalMethod: 'execution', updateStrategy: 'static',
    datasetSize: '1,140 tasks', sotaRange: '50–65%',
    description: { zh: '实际编程任务基准，需要调用多个库完成复杂功能', en: 'Practical programming tasks requiring multi-library calls for complex functionality' },
    keyFeature: { zh: '覆盖 139 个 Python 库，比 HumanEval 更贴近真实开发', en: 'Covers 139 Python libraries, more realistic than HumanEval' } },
  { name: 'MBPP', year: 2021, category: 'code', evalMethod: 'execution', updateStrategy: 'static',
    datasetSize: '974 (500 test)', sotaRange: '85–92%',
    description: { zh: 'Mostly Basic Python Problems：入门级 Python 编程题', en: 'Mostly Basic Python Problems: entry-level Python programming' },
    keyFeature: { zh: '与 HumanEval 互补的入门代码基准', en: 'Complementary entry-level code benchmark to HumanEval' } },
  // Agent
  { name: 'BFCL', year: 2024, category: 'agent', evalMethod: 'execution', updateStrategy: 'dynamic',
    datasetSize: '~2,000+ scenarios', sotaRange: '70–90%',
    description: { zh: 'Berkeley Function Calling Leaderboard：评估 LLM 函数/工具调用能力', en: 'Berkeley Function Calling Leaderboard: evaluates LLM function/tool calling ability' },
    keyFeature: { zh: '区分 FC 原生模型与 Prompt 模型，V4 引入 Agentic 评估', en: 'Distinguishes FC-native vs Prompt models; V4 introduces agentic evaluation' } },
  { name: 'GAIA', year: 2023, category: 'agent', evalMethod: 'exact_match', updateStrategy: 'static',
    datasetSize: '466 questions (3 levels)', sotaRange: '50–75%',
    description: { zh: 'General AI Assistants：需要多步推理、工具使用和网页浏览的综合任务', en: 'General AI Assistants: tasks requiring multi-step reasoning, tool use, and web browsing' },
    keyFeature: { zh: '人类准确率 92%，但最强 AI 仅约 75%', en: 'Human accuracy 92%, but strongest AI only ~75%' } },
  { name: 'WebArena', year: 2024, category: 'agent', evalMethod: 'execution', updateStrategy: 'static',
    datasetSize: '812 tasks', sotaRange: '25–45%',
    description: { zh: '在真实网站环境中完成网页操作任务（购物/论坛/地图等）', en: 'Complete web tasks in real website environments (shopping/forum/maps)' },
    keyFeature: { zh: '端到端 Agent 评估，需要多步网页交互', en: 'End-to-end agent evaluation requiring multi-step web interaction' } },
  // Preference
  { name: 'Chatbot Arena', year: 2023, category: 'preference', evalMethod: 'elo', updateStrategy: 'dynamic',
    datasetSize: '1,000,000+ votes', sotaRange: 'ELO 1200–1400',
    description: { zh: 'LMSYS 众包匿名对战平台，用户盲评两个模型的回答', en: 'LMSYS crowdsourced anonymous battle platform, users blind-evaluate two model responses' },
    keyFeature: { zh: '最具公信力的开放偏好排名，100 万+ 人类投票', en: 'Most credible open preference ranking with 1M+ human votes' } },
  { name: 'AlpacaEval', year: 2023, category: 'preference', evalMethod: 'llm_judge', updateStrategy: 'static',
    datasetSize: '805 instructions', sotaRange: 'LC WR 50–85%',
    description: { zh: '使用 GPT-4 作为 Judge 对比模型回答 vs 参考回答的胜率', en: 'Uses GPT-4 as judge to compute win rate of model vs reference responses' },
    keyFeature: { zh: 'Length-Controlled Win Rate 修正了长度偏差', en: 'Length-Controlled Win Rate corrects length bias' } },
  { name: 'MT-Bench', year: 2023, category: 'preference', evalMethod: 'llm_judge', updateStrategy: 'static',
    datasetSize: '80 (multi-turn)', sotaRange: '8.5–9.5 / 10',
    description: { zh: '多轮对话评估：80 个高质量多轮问题，GPT-4 打分 1-10', en: 'Multi-turn evaluation: 80 high-quality multi-turn questions, GPT-4 scores 1-10' },
    keyFeature: { zh: '首个系统化的 LLM-as-Judge 基准', en: 'First systematic LLM-as-Judge benchmark' } },
  // Dynamic (cross-category)
  { name: 'LiveBench', year: 2024, category: 'reasoning', evalMethod: 'exact_match', updateStrategy: 'dynamic',
    datasetSize: '~900+ (monthly refresh)', sotaRange: '50–70%',
    description: { zh: '每月更新的综合基准，从最新信息源（竞赛/论文/新闻）出题', en: 'Monthly-refreshed comprehensive benchmark sourcing from latest competitions/papers/news' },
    keyFeature: { zh: '覆盖数学/代码/推理/语言/指令遵循/数据分析 6 大类', en: 'Covers math/code/reasoning/language/instruction-following/data-analysis' } },
];

const CATEGORY_COLORS: Record<Category, string> = {
  knowledge: COLORS.primary,
  reasoning: COLORS.green,
  code: COLORS.orange,
  agent: COLORS.purple,
  preference: '#c62828',
};

const CATEGORY_LABELS: Record<Category, { zh: string; en: string }> = {
  knowledge: { zh: '知识', en: 'Knowledge' },
  reasoning: { zh: '推理', en: 'Reasoning' },
  code: { zh: '代码', en: 'Code' },
  agent: { zh: 'Agent', en: 'Agent' },
  preference: { zh: '偏好', en: 'Preference' },
};

const EVAL_LABELS: Record<EvalMethod, { zh: string; en: string }> = {
  exact_match: { zh: '精确匹配', en: 'Exact Match' },
  execution: { zh: '执行验证', en: 'Execution' },
  llm_judge: { zh: 'LLM 评审', en: 'LLM Judge' },
  human_eval: { zh: '人类评估', en: 'Human Eval' },
  elo: { zh: 'ELO 排名', en: 'ELO Rating' },
};

const UPDATE_LABELS: Record<UpdateStrategy, { zh: string; en: string }> = {
  static: { zh: '静态', en: 'Static' },
  dynamic: { zh: '动态更新', en: 'Dynamic' },
};

export default function BenchmarkTaxonomy({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;

  const [selectedCats, setSelectedCats] = useState<Set<Category>>(new Set());
  const [selectedEval, setSelectedEval] = useState<Set<EvalMethod>>(new Set());
  const [selectedUpdate, setSelectedUpdate] = useState<Set<UpdateStrategy>>(new Set());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleFilter = <T,>(set: Set<T>, item: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item); else next.add(item);
    setter(next);
  };

  const filtered = BENCHMARKS.filter(b => {
    if (selectedCats.size > 0 && !selectedCats.has(b.category)) return false;
    if (selectedEval.size > 0 && !selectedEval.has(b.evalMethod)) return false;
    if (selectedUpdate.size > 0 && !selectedUpdate.has(b.updateStrategy)) return false;
    return true;
  });

  const btnStyle = (active: boolean, color?: string): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    border: `1.5px solid ${active ? (color || COLORS.primary) : COLORS.light}`,
    background: active ? (color || COLORS.primary) + '18' : '#fff',
    color: active ? (color || COLORS.primary) : COLORS.mid,
    transition: 'all 0.15s',
    userSelect: 'none' as const,
  });

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.dark }}>
          {t('Benchmark 分类浏览器', 'Benchmark Taxonomy Browser')}
        </span>
        <span style={{ fontSize: 12, color: COLORS.mid, marginLeft: 8 }}>
          {t(`(${filtered.length}/${BENCHMARKS.length} 个)`, `(${filtered.length}/${BENCHMARKS.length})`)}
        </span>
      </div>

      {/* Filter bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {/* Category filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: COLORS.mid, width: 60, flexShrink: 0 }}>
            {t('能力维度', 'Category')}:
          </span>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
            <span key={cat} style={btnStyle(selectedCats.has(cat), CATEGORY_COLORS[cat])}
              onClick={() => toggleFilter(selectedCats, cat, setSelectedCats)}>
              {CATEGORY_LABELS[cat][locale]}
            </span>
          ))}
        </div>
        {/* Eval method filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: COLORS.mid, width: 60, flexShrink: 0 }}>
            {t('评估方式', 'Eval Method')}:
          </span>
          {(Object.keys(EVAL_LABELS) as EvalMethod[]).map(ev => (
            <span key={ev} style={btnStyle(selectedEval.has(ev))}
              onClick={() => toggleFilter(selectedEval, ev, setSelectedEval)}>
              {EVAL_LABELS[ev][locale]}
            </span>
          ))}
        </div>
        {/* Update strategy filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: COLORS.mid, width: 60, flexShrink: 0 }}>
            {t('更新策略', 'Update')}:
          </span>
          {(Object.keys(UPDATE_LABELS) as UpdateStrategy[]).map(up => (
            <span key={up} style={btnStyle(selectedUpdate.has(up))}
              onClick={() => toggleFilter(selectedUpdate, up, setSelectedUpdate)}>
              {UPDATE_LABELS[up][locale]}
            </span>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence mode="popLayout">
          {filtered.map(b => {
            const isExpanded = expandedCard === b.name;
            return (
              <motion.div key={b.name}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => setExpandedCard(isExpanded ? null : b.name)}
                style={{
                  borderLeft: `4px solid ${CATEGORY_COLORS[b.category]}`,
                  borderRadius: 8,
                  background: '#fff',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: `1px solid ${COLORS.light}`,
                  borderLeftWidth: 4,
                  borderLeftColor: CATEGORY_COLORS[b.category],
                }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark }}>{b.name}</span>
                    <span style={{ fontSize: 11, color: COLORS.mid }}>({b.year})</span>
                    {b.updateStrategy === 'dynamic' && (
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8,
                        background: COLORS.orange + '20', color: COLORS.orange, fontWeight: 600 }}>
                        {t('动态', 'Dynamic')}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6,
                      background: CATEGORY_COLORS[b.category] + '15',
                      color: CATEGORY_COLORS[b.category] }}>
                      {CATEGORY_LABELS[b.category][locale]}
                    </span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6,
                      background: COLORS.highlight, color: COLORS.dark }}>
                      {EVAL_LABELS[b.evalMethod][locale]}
                    </span>
                  </div>
                </div>
                {/* Summary row */}
                <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 11, color: COLORS.mid }}>
                  <span>{t('数据量', 'Size')}: {b.datasetSize}</span>
                  <span>SOTA: {b.sotaRange}</span>
                </div>
                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ marginTop: 8, paddingTop: 8,
                        borderTop: `1px dashed ${COLORS.light}` }}>
                        <p style={{ fontSize: 12, color: COLORS.dark, margin: '0 0 4px 0', lineHeight: 1.5 }}>
                          {b.description[locale]}
                        </p>
                        <p style={{ fontSize: 11, color: COLORS.primary, margin: 0, fontWeight: 500 }}>
                          {t('特点', 'Key')}: {b.keyFeature[locale]}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 24, color: COLORS.mid, fontSize: 13 }}>
          {t('没有匹配的 Benchmark，请调整筛选条件', 'No matching benchmarks. Adjust filters.')}
        </div>
      )}
    </div>
  );
}
