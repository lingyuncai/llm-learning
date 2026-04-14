import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

type Category = 'knowledge' | 'reasoning' | 'math';

interface ReasoningBenchmark {
  name: string;
  year: number;
  bestScore: number;
  adoptionFreq: number;
  category: Category;
  description: { zh: string; en: string };
  status: { zh: string; en: string };
}

// Scores verified via web search (2025-04):
// MMLU ~90%: GPT-4o/Claude 3.5 class; MMLU-Pro ~78%: TIGER-Lab leaderboard
// GSM8K ~97%: o1/GPT-4o saturated; MATH-500 ~95%: o1 94.8%
// AIME 2024 ~87%: o3-mini (high) 87.3%; GPQA Diamond ~88%: o3 87.7%
// BBH ~88%: GPT-4 class; FrontierMath ~25%: o3 reported ~25%
// ARC-Challenge ~96%: saturated; HellaSwag ~97%: saturated
const BENCHMARKS: ReasoningBenchmark[] = [
  { name: 'MMLU', year: 2021, bestScore: 92, adoptionFreq: 10, category: 'knowledge',
    description: { zh: '57 学科通用知识，4 选 1', en: '57-subject knowledge, 4-choice' },
    status: { zh: '已饱和', en: 'Saturated' } },
  { name: 'MMLU-Pro', year: 2024, bestScore: 78, adoptionFreq: 9, category: 'knowledge',
    description: { zh: 'MMLU 升级版，10 选项，推理需求更强', en: 'MMLU upgrade, 10 choices, stronger reasoning' },
    status: { zh: '主力基准', en: 'Primary benchmark' } },
  { name: 'GSM8K', year: 2021, bestScore: 97, adoptionFreq: 8, category: 'math',
    description: { zh: '小学数学应用题', en: 'Grade school math' },
    status: { zh: '已饱和', en: 'Saturated' } },
  { name: 'MATH-500', year: 2021, bestScore: 95, adoptionFreq: 7, category: 'math',
    description: { zh: '竞赛级数学（o1 达 94.8%）', en: 'Competition math (o1 reached 94.8%)' },
    status: { zh: '接近饱和', en: 'Near saturation' } },
  { name: 'AIME 2024', year: 2024, bestScore: 87, adoptionFreq: 8, category: 'math',
    description: { zh: '美国数学邀请赛真题（o3-mini 达 87.3%）', en: 'AMC Invitational Exam (o3-mini: 87.3%)' },
    status: { zh: '仍有区分力', en: 'Still discriminative' } },
  { name: 'GPQA Diamond', year: 2023, bestScore: 88, adoptionFreq: 9, category: 'reasoning',
    description: { zh: '研究生级科学问答（o3 达 87.7%）', en: 'Graduate-level science QA (o3: 87.7%)' },
    status: { zh: '仍有区分力', en: 'Still discriminative' } },
  { name: 'BBH', year: 2022, bestScore: 88, adoptionFreq: 6, category: 'reasoning',
    description: { zh: '23 个困难推理任务', en: '23 hard reasoning tasks' },
    status: { zh: '接近饱和', en: 'Near saturation' } },
  { name: 'FrontierMath', year: 2024, bestScore: 25, adoptionFreq: 3, category: 'math',
    description: { zh: '极难数学，o3 约 25%，其余模型 <2%', en: 'Extremely hard math, o3 ~25%, others <2%' },
    status: { zh: '远未饱和', en: 'Far from saturated' } },
  { name: 'ARC-Challenge', year: 2018, bestScore: 96, adoptionFreq: 5, category: 'reasoning',
    description: { zh: '小学科学多步推理', en: 'Grade school science reasoning' },
    status: { zh: '已饱和', en: 'Saturated' } },
  { name: 'HellaSwag', year: 2019, bestScore: 97, adoptionFreq: 4, category: 'reasoning',
    description: { zh: '常识推理补全', en: 'Commonsense completion' },
    status: { zh: '已饱和', en: 'Saturated' } },
];

const CATEGORY_META: Record<Category, { color: string; label: { zh: string; en: string } }> = {
  knowledge: { color: COLORS.primary, label: { zh: '知识', en: 'Knowledge' } },
  reasoning: { color: COLORS.purple, label: { zh: '推理', en: 'Reasoning' } },
  math: { color: COLORS.orange, label: { zh: '数学', en: 'Math' } },
};

const W = 600;
const H = 400;
const PAD = { top: 30, right: 30, bottom: 50, left: 60 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const YEAR_MIN = 2017;
const YEAR_MAX = 2026;
const SCORE_MIN = 0;
const SCORE_MAX = 105;

const xScale = (year: number) => PAD.left + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * plotW;
const yScale = (score: number) => PAD.top + plotH - ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * plotH;
const rScale = (freq: number) => 6 + freq * 1.8;

export default function ReasoningBenchmarkMap({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;
  const [hovered, setHovered] = useState<string | null>(null);

  const xTicks = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const yTicks = [0, 20, 40, 60, 80, 90, 100];

  return (
    <div style={{ fontFamily: FONTS.sans, maxWidth: W, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark }}>
          {t('知识与推理 Benchmark 饱和度地图', 'Knowledge & Reasoning Benchmark Saturation Map')}
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}>
        {(Object.keys(CATEGORY_META) as Category[]).map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width={12} height={12}>
              <circle cx={6} cy={6} r={5} fill={CATEGORY_META[cat].color} opacity={0.7} />
            </svg>
            <span style={{ fontSize: 11, color: COLORS.mid }}>{CATEGORY_META[cat].label[locale]}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width={30} height={12}>
            <circle cx={6} cy={6} r={4} fill={COLORS.mid} opacity={0.3} />
            <circle cx={20} cy={6} r={7} fill={COLORS.mid} opacity={0.3} />
          </svg>
          <span style={{ fontSize: 11, color: COLORS.mid }}>{t('气泡大小 = 引用频率', 'Bubble size = adoption')}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* Grid lines */}
        {yTicks.map(tick => (
          <line key={`gy-${tick}`}
            x1={PAD.left} x2={W - PAD.right}
            y1={yScale(tick)} y2={yScale(tick)}
            stroke={COLORS.light} strokeWidth={0.8} />
        ))}
        {xTicks.map(tick => (
          <line key={`gx-${tick}`}
            x1={xScale(tick)} x2={xScale(tick)}
            y1={PAD.top} y2={PAD.top + plotH}
            stroke={COLORS.light} strokeWidth={0.8} />
        ))}

        {/* Saturation line at 90% */}
        <line
          x1={PAD.left} x2={W - PAD.right}
          y1={yScale(90)} y2={yScale(90)}
          stroke={COLORS.red} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.6} />
        <text x={W - PAD.right - 4} y={yScale(90) - 6}
          textAnchor="end" fontSize={10} fill={COLORS.red} fontFamily={FONTS.sans} fontWeight={600}>
          {t('饱和线 90%', 'Saturation Line 90%')}
        </text>

        {/* Axes */}
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH}
          stroke={COLORS.dark} strokeWidth={1.2} />
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + plotH}
          stroke={COLORS.dark} strokeWidth={1.2} />

        {/* X axis ticks + labels */}
        {xTicks.map(tick => (
          <g key={`xt-${tick}`}>
            <line x1={xScale(tick)} x2={xScale(tick)}
              y1={PAD.top + plotH} y2={PAD.top + plotH + 5}
              stroke={COLORS.dark} strokeWidth={1} />
            <text x={xScale(tick)} y={PAD.top + plotH + 18}
              textAnchor="middle" fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
              {tick}
            </text>
          </g>
        ))}

        {/* Y axis ticks + labels */}
        {yTicks.map(tick => (
          <g key={`yt-${tick}`}>
            <line x1={PAD.left - 5} x2={PAD.left}
              y1={yScale(tick)} y2={yScale(tick)}
              stroke={COLORS.dark} strokeWidth={1} />
            <text x={PAD.left - 10} y={yScale(tick) + 4}
              textAnchor="end" fontSize={10} fill={COLORS.mid} fontFamily={FONTS.mono}>
              {tick}%
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={PAD.left + plotW / 2} y={H - 6}
          textAnchor="middle" fontSize={12} fill={COLORS.dark} fontFamily={FONTS.sans} fontWeight={600}>
          {t('发布年份', 'Publication Year')}
        </text>
        <text x={14} y={PAD.top + plotH / 2}
          textAnchor="middle" fontSize={12} fill={COLORS.dark} fontFamily={FONTS.sans} fontWeight={600}
          transform={`rotate(-90, 14, ${PAD.top + plotH / 2})`}>
          {t('当前最高分 (%)', 'Current Best Score (%)')}
        </text>

        {/* Bubbles */}
        {BENCHMARKS.map(b => {
          const cx = xScale(b.year);
          const cy = yScale(b.bestScore);
          const r = rScale(b.adoptionFreq);
          const isHovered = hovered === b.name;
          return (
            <g key={b.name}
              onMouseEnter={() => setHovered(b.name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}>
              <motion.circle
                cx={cx} cy={cy} r={r}
                fill={CATEGORY_META[b.category].color}
                opacity={isHovered ? 0.9 : 0.55}
                stroke={isHovered ? COLORS.dark : 'none'}
                strokeWidth={isHovered ? 1.5 : 0}
                animate={{ r: isHovered ? r + 3 : r }}
                transition={{ duration: 0.15 }}
              />
              {/* Label */}
              <text x={cx} y={cy - r - 4}
                textAnchor="middle" fontSize={9} fontWeight={600}
                fill={COLORS.dark} fontFamily={FONTS.sans}
                style={{ pointerEvents: 'none' }}>
                {b.name}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (() => {
            const b = BENCHMARKS.find(b => b.name === hovered)!;
            const tx = Math.min(xScale(b.year), W - PAD.right - 150);
            const ty = Math.max(yScale(b.bestScore) - rScale(b.adoptionFreq) - 70, PAD.top);
            return (
              <motion.g
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}>
                <rect x={tx - 10} y={ty} width={170} height={60} rx={6}
                  fill="#fff" stroke={COLORS.light} strokeWidth={1}
                  filter="url(#shadow)" />
                <text x={tx} y={ty + 15} fontSize={11} fontWeight={700}
                  fill={CATEGORY_META[b.category].color} fontFamily={FONTS.sans}>
                  {b.name} — {b.bestScore}%
                </text>
                <text x={tx} y={ty + 30} fontSize={10} fill={COLORS.dark} fontFamily={FONTS.sans}>
                  {b.description[locale]}
                </text>
                <text x={tx} y={ty + 45} fontSize={10} fill={COLORS.mid} fontFamily={FONTS.sans}>
                  {t('状态', 'Status')}: {b.status[locale]}
                </text>
              </motion.g>
            );
          })()}
        </AnimatePresence>

        {/* Shadow filter */}
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
