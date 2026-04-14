// src/components/interactive/ModelBenchmarkMatrix.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type ModelTier = 'frontier' | 'small';
type BenchCategory = 'knowledge' | 'reasoning' | 'code' | 'agent' | 'preference';

interface BenchmarkColumn {
  id: string;
  name: string;
  category: BenchCategory;
}

interface ModelRow {
  name: string;
  tier: ModelTier;
  family: string;
  scores: Record<string, number | null>;
  source: string;
}

const BENCHMARKS: BenchmarkColumn[] = [
  { id: 'mmlu', name: 'MMLU', category: 'knowledge' },
  { id: 'mmlu-pro', name: 'MMLU-Pro', category: 'knowledge' },
  { id: 'ifeval', name: 'IFEval', category: 'knowledge' },
  { id: 'gpqa', name: 'GPQA Diamond', category: 'reasoning' },
  { id: 'math500', name: 'MATH-500', category: 'reasoning' },
  { id: 'aime', name: 'AIME 2024', category: 'reasoning' },
  { id: 'bbh', name: 'BBH', category: 'reasoning' },
  { id: 'arc', name: 'ARC-C', category: 'reasoning' },
  { id: 'humaneval', name: 'HumanEval', category: 'code' },
  { id: 'swe-bench', name: 'SWE-bench Verified', category: 'code' },
  { id: 'livecodebench', name: 'LiveCodeBench', category: 'code' },
  { id: 'bfcl', name: 'BFCL', category: 'agent' },
  { id: 'gaia', name: 'GAIA', category: 'agent' },
  { id: 'arena-elo', name: 'Arena ELO', category: 'preference' },
];

// Scores compiled from official technical reports and model cards:
// - Meta Llama 3.1: HuggingFace model card (meta-llama/Llama-3.1-405B-Instruct, 8B-Instruct)
// - GPT-4o: OpenAI system card, Vellum leaderboard aggregation
// - Claude 3.5 Sonnet: Anthropic blog, Vellum leaderboard aggregation
// - Gemini 1.5 Pro: Google DeepMind technical report (arxiv 2403.05530)
// - Gemma 2 9B: Google model card (ai.google.dev/gemma)
// - Phi-3 Mini: Microsoft HuggingFace model card (Phi-3-mini-4k-instruct)
// - Qwen 2.5 7B: Qwen technical report (arxiv 2412.15115), Qwen2 report (arxiv 2407.10671)
// - Mistral 7B: Mistral AI technical report (arxiv 2310.06825)
// null = not reported in the model's official release (an important signal)
const MODELS: ModelRow[] = [
  {
    name: 'GPT-4o', tier: 'frontier', family: 'GPT',
    scores: {
      'mmlu': 88.7, 'mmlu-pro': 72.6, 'ifeval': 84.3,
      'gpqa': 53.6, 'math500': 76.6, 'aime': 9.3, 'bbh': 83.6, 'arc': 96.4,
      'humaneval': 90.2, 'swe-bench': 38.4, 'livecodebench': null, 'bfcl': 88.5,
      'gaia': 40.5, 'arena-elo': 1285,
    },
    source: 'OpenAI system card & blog',
  },
  {
    name: 'Claude 3.5 Sonnet', tier: 'frontier', family: 'Claude',
    scores: {
      'mmlu': 88.7, 'mmlu-pro': 78.0, 'ifeval': 88.0,
      'gpqa': 65.0, 'math500': 78.3, 'aime': null, 'bbh': 93.1, 'arc': null,
      'humaneval': 92.0, 'swe-bench': 49.0, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': 1271,
    },
    source: 'Anthropic blog & model card',
  },
  {
    name: 'Gemini 1.5 Pro', tier: 'frontier', family: 'Gemini',
    scores: {
      'mmlu': 85.9, 'mmlu-pro': 69.4, 'ifeval': null,
      'gpqa': 46.2, 'math500': 67.7, 'aime': null, 'bbh': 84.0, 'arc': null,
      'humaneval': 84.1, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': 1260,
    },
    source: 'Google DeepMind tech report',
  },
  {
    name: 'Llama 3.1 405B', tier: 'frontier', family: 'Llama',
    scores: {
      'mmlu': 87.3, 'mmlu-pro': 73.3, 'ifeval': 88.6,
      'gpqa': 50.7, 'math500': 73.8, 'aime': null, 'bbh': 85.9, 'arc': 96.1,
      'humaneval': 89.0, 'swe-bench': 33.2, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': 1253,
    },
    source: 'Meta Llama 3.1 model card',
  },
  {
    name: 'Gemma 2 9B', tier: 'small', family: 'Gemma',
    scores: {
      'mmlu': 71.3, 'mmlu-pro': null, 'ifeval': null,
      'gpqa': null, 'math500': 36.6, 'aime': null, 'bbh': 68.2, 'arc': 68.4,
      'humaneval': 40.2, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': 1187,
    },
    source: 'Google Gemma 2 tech report',
  },
  {
    name: 'Phi-3 Mini 3.8B', tier: 'small', family: 'Phi',
    scores: {
      'mmlu': 70.9, 'mmlu-pro': null, 'ifeval': null,
      'gpqa': 30.6, 'math500': null, 'aime': null, 'bbh': 73.5, 'arc': 86.3,
      'humaneval': 57.3, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': null,
    },
    source: 'Microsoft Phi-3 tech report',
  },
  {
    name: 'Qwen 2.5 7B', tier: 'small', family: 'Qwen',
    scores: {
      'mmlu': 74.2, 'mmlu-pro': 56.3, 'ifeval': 74.6,
      'gpqa': 34.2, 'math500': 75.5, 'aime': null, 'bbh': 70.4, 'arc': null,
      'humaneval': 84.8, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': null,
    },
    source: 'Qwen 2.5 tech report',
  },
  {
    name: 'Llama 3.1 8B', tier: 'small', family: 'Llama',
    scores: {
      'mmlu': 69.4, 'mmlu-pro': 48.3, 'ifeval': 80.4,
      'gpqa': 30.4, 'math500': 51.9, 'aime': null, 'bbh': 64.2, 'arc': 83.4,
      'humaneval': 72.6, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': 1176,
    },
    source: 'Meta Llama 3.1 model card',
  },
  {
    name: 'Mistral 7B', tier: 'small', family: 'Mistral',
    scores: {
      'mmlu': 62.5, 'mmlu-pro': null, 'ifeval': null,
      'gpqa': null, 'math500': null, 'aime': null, 'bbh': null, 'arc': 78.5,
      'humaneval': 32.9, 'swe-bench': null, 'livecodebench': null, 'bfcl': null,
      'gaia': null, 'arena-elo': 1072,
    },
    source: 'Mistral AI tech report',
  },
];

const CATEGORY_COLORS: Record<BenchCategory, string> = {
  knowledge: '#1565c0',
  reasoning: '#6a1b9a',
  code: '#2e7d32',
  agent: '#e65100',
  preference: '#c62828',
};

const CATEGORY_LABELS: Record<BenchCategory, { zh: string; en: string }> = {
  knowledge: { zh: '知识', en: 'Knowledge' },
  reasoning: { zh: '推理', en: 'Reasoning' },
  code: { zh: '代码', en: 'Code' },
  agent: { zh: '智能体', en: 'Agent' },
  preference: { zh: '偏好', en: 'Preference' },
};

function getColumnRange(benchId: string, models: ModelRow[]): { min: number; max: number } {
  const values = models.map(m => m.scores[benchId]).filter((v): v is number => v !== null);
  if (values.length === 0) return { min: 0, max: 100 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 5;
  return { min: Math.max(0, min - padding), max: max + padding };
}

function scoreToColor(score: number | null, benchId: string, models: ModelRow[]): string {
  if (score === null) return 'null';
  const { min, max } = getColumnRange(benchId, models);
  const norm = max === min ? 0.5 : (score - min) / (max - min);
  // Green gradient: low=red/orange, mid=yellow, high=green
  const r = Math.round(255 - norm * 200);
  const g = Math.round(80 + norm * 150);
  const b = Math.round(80);
  return `rgb(${r}, ${g}, ${b})`;
}

function scoreTextColor(score: number | null, benchId: string, models: ModelRow[]): string {
  if (score === null) return COLORS.mid;
  const { min, max } = getColumnRange(benchId, models);
  const norm = max === min ? 0.5 : (score - min) / (max - min);
  return norm > 0.5 ? '#fff' : COLORS.dark;
}

type GroupMode = 'tier' | 'family';

export default function ModelBenchmarkMatrix({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [hoveredCell, setHoveredCell] = useState<{ model: string; bench: string } | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>('tier');

  const groupedModels = useMemo(() => {
    if (groupMode === 'tier') {
      return [
        { label: t('Frontier 模型', 'Frontier Models'), models: MODELS.filter(m => m.tier === 'frontier') },
        { label: t('小模型 (≤10B)', 'Small Models (≤10B)'), models: MODELS.filter(m => m.tier === 'small') },
      ];
    }
    const families = [...new Set(MODELS.map(m => m.family))];
    return families.map(f => ({
      label: f,
      models: MODELS.filter(m => m.family === f),
    }));
  }, [groupMode, locale]);

  const categoryGroups = useMemo(() => {
    const cats: BenchCategory[] = ['knowledge', 'reasoning', 'code', 'agent', 'preference'];
    return cats.map(cat => ({
      category: cat,
      benchmarks: BENCHMARKS.filter(b => b.category === cat),
    }));
  }, []);

  const hoveredModel = hoveredCell ? MODELS.find(m => m.name === hoveredCell.model) : null;
  const hoveredBench = hoveredCell ? BENCHMARKS.find(b => b.id === hoveredCell.bench) : null;
  const hoveredScore = hoveredModel && hoveredCell
    ? hoveredModel.scores[hoveredCell.bench] : null;

  const CELL_W = 54;
  const CELL_H = 32;
  const LABEL_W = 120;
  const HEADER_H = 80;
  const CAT_HEADER_H = 20;

  return (
    <div className="my-6 border rounded-lg bg-white overflow-hidden" style={{ fontFamily: FONTS.sans }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
        <h3 className="text-sm font-semibold" style={{ color: COLORS.dark }}>
          {t('模型 × Benchmark 热力矩阵', 'Model × Benchmark Heatmap Matrix')}
        </h3>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setGroupMode('tier')}
            className="px-2 py-1 rounded transition-colors"
            style={{
              background: groupMode === 'tier' ? COLORS.primary : '#e2e8f0',
              color: groupMode === 'tier' ? '#fff' : COLORS.mid,
            }}
          >
            {t('按能力分组', 'By Tier')}
          </button>
          <button
            onClick={() => setGroupMode('family')}
            className="px-2 py-1 rounded transition-colors"
            style={{
              background: groupMode === 'family' ? COLORS.primary : '#e2e8f0',
              color: groupMode === 'family' ? '#fff' : COLORS.mid,
            }}
          >
            {t('按模型族分组', 'By Family')}
          </button>
        </div>
      </div>

      {/* Scrollable matrix */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: LABEL_W + BENCHMARKS.length * CELL_W + 20 }}>
          {/* Category headers */}
          <div className="flex" style={{ paddingLeft: LABEL_W }}>
            {categoryGroups.map(({ category, benchmarks }) => (
              <div
                key={category}
                style={{
                  width: benchmarks.length * CELL_W,
                  height: CAT_HEADER_H,
                  background: CATEGORY_COLORS[category],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="text-xs font-medium text-white">
                  {CATEGORY_LABELS[category][locale]}
                </span>
              </div>
            ))}
          </div>

          {/* Benchmark name headers (rotated) */}
          <div className="flex" style={{ paddingLeft: LABEL_W, height: HEADER_H }}>
            {BENCHMARKS.map(bench => (
              <div
                key={bench.id}
                style={{
                  width: CELL_W,
                  height: HEADER_H,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 4,
                  borderBottom: `2px solid ${CATEGORY_COLORS[bench.category]}`,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: FONTS.mono,
                    color: COLORS.dark,
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'center center',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {bench.name}
                </span>
              </div>
            ))}
          </div>

          {/* Model rows grouped */}
          {groupedModels.map((group, gi) => (
            <div key={gi}>
              {/* Group header */}
              <div
                className="flex items-center px-3 py-1"
                style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}
              >
                <span className="text-xs font-semibold" style={{ color: COLORS.mid }}>
                  {group.label}
                </span>
              </div>

              {/* Model rows */}
              {group.models.map((model, mi) => (
                <div
                  key={model.name}
                  className="flex items-stretch"
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                  {/* Model name cell */}
                  <div
                    style={{
                      width: LABEL_W,
                      minWidth: LABEL_W,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 12,
                      paddingRight: 8,
                      background: mi % 2 === 0 ? '#fff' : '#fafbfc',
                    }}
                  >
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: COLORS.dark, fontFamily: FONTS.mono }}
                      title={model.name}
                    >
                      {model.name}
                    </span>
                  </div>

                  {/* Score cells */}
                  {BENCHMARKS.map(bench => {
                    const score = model.scores[bench.id];
                    const bgColor = scoreToColor(score, bench.id, MODELS);
                    const txtColor = scoreTextColor(score, bench.id, MODELS);
                    const isHovered = hoveredCell?.model === model.name && hoveredCell?.bench === bench.id;
                    const isNull = score === null;

                    return (
                      <motion.div
                        key={bench.id}
                        style={{
                          width: CELL_W,
                          minWidth: CELL_W,
                          height: CELL_H,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          background: isNull ? undefined : bgColor,
                          borderLeft: '1px solid #f1f5f9',
                        }}
                        animate={{
                          scale: isHovered ? 1.08 : 1,
                          zIndex: isHovered ? 10 : 1,
                        }}
                        transition={{ duration: 0.15 }}
                        onMouseEnter={() => setHoveredCell({ model: model.name, bench: bench.id })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {isNull ? (
                          <>
                            {/* Diagonal stripe pattern for null values */}
                            <svg
                              style={{ position: 'absolute', inset: 0 }}
                              width="100%"
                              height="100%"
                            >
                              <defs>
                                <pattern id={`stripe-${model.name}-${bench.id}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                                  <line x1="0" y1="0" x2="0" y2="6" stroke="#d1d5db" strokeWidth="1.5" />
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="#f3f4f6" />
                              <rect width="100%" height="100%" fill={`url(#stripe-${model.name}-${bench.id})`} />
                            </svg>
                            <span
                              style={{
                                fontSize: 8,
                                color: COLORS.mid,
                                position: 'relative',
                                zIndex: 2,
                              }}
                            >
                              N/R
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: 9, fontWeight: 600, color: txtColor, fontFamily: FONTS.mono }}>
                            {bench.id === 'arena-elo' ? score : score}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip / Info panel */}
      <AnimatePresence>
        {hoveredCell && hoveredModel && hoveredBench && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="mx-4 mb-3 mt-1 p-3 rounded-lg border text-xs"
            style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold" style={{ color: COLORS.dark }}>
                {hoveredModel.name}
              </span>
              <span style={{ color: CATEGORY_COLORS[hoveredBench.category] }}>
                {hoveredBench.name}
              </span>
              {hoveredScore !== null ? (
                <span className="font-mono font-bold" style={{ color: COLORS.green }}>
                  {hoveredBench.id === 'arena-elo'
                    ? `ELO ${hoveredScore}`
                    : `${hoveredScore}%`}
                </span>
              ) : (
                <span style={{ color: COLORS.red }}>
                  {t('未报告 — 不报什么暗示弱项', 'Not Reported — omission suggests weakness')}
                </span>
              )}
              <span style={{ color: COLORS.mid }}>
                {t('来源', 'Source')}: {hoveredModel.source}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4 flex-wrap text-xs" style={{ color: COLORS.mid }}>
        <div className="flex items-center gap-1">
          <div style={{ width: 14, height: 14, background: 'rgb(55, 230, 80)', borderRadius: 2 }} />
          <span>{t('列内高分', 'High (in-column)')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div style={{ width: 14, height: 14, background: 'rgb(255, 130, 80)', borderRadius: 2 }} />
          <span>{t('列内低分', 'Low (in-column)')}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="14" height="14">
            <defs>
              <pattern id="legend-stripe" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#d1d5db" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="14" height="14" fill="#f3f4f6" rx="2" />
            <rect width="14" height="14" fill="url(#legend-stripe)" rx="2" />
          </svg>
          <span>{t('N/R = 未报告（暗示弱项）', 'N/R = Not Reported (implies weakness)')}</span>
        </div>
        <span className="ml-auto italic">
          {t('每列独立归一化，颜色仅反映列内相对排名', 'Per-column normalization — colors show relative rank within column')}
        </span>
      </div>
    </div>
  );
}
