import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
}

interface Dependence {
  di: number;
  dj: number;
  label: string;
}

interface Scenario {
  id: string;
  name: { zh: string; en: string };
  code: string;
  dependences: Dependence[];
  description?: { zh: string; en: string };
}

type TransformType = 'interchange' | 'tiling' | 'skewing' | 'reverse';

interface LegalityResult {
  legal: boolean;
  reason: { zh: string; en: string };
}

/* ─── Data ─── */

const SCENARIOS: Scenario[] = [
  {
    id: 'no_dep',
    name: { zh: '无依赖', en: 'No Dependence' },
    code: 'C[i][j] = A[i][j]+B[i][j]',
    dependences: [],
  },
  {
    id: 'flow_i',
    name: { zh: '流依赖(i)', en: 'Flow Dep (i)' },
    code: 'A[i][j] = A[i-1][j]+1',
    dependences: [{ di: 1, dj: 0, label: '(1,0)' }],
  },
  {
    id: 'flow_diag',
    name: { zh: '对角线依赖', en: 'Diagonal Dep' },
    code: 'A[i][j] = A[i-1][j-1]*2',
    dependences: [{ di: 1, dj: 1, label: '(1,1)' }],
  },
  {
    id: 'anti_dep',
    name: { zh: '反依赖', en: 'Anti-dependence' },
    code: 'A[i+1][j] = A[i][j]+1',
    dependences: [{ di: 1, dj: 0, label: '(1,0)' }],
    description: {
      zh: 'WAR反依赖。向量(1,0)为正，正向遍历自然满足；反向会错误。',
      en: 'WAR anti-dependence. Positive vector means forward traversal satisfies it.',
    },
  },
];

const SPACE_SIZE = 8;

/* ─── SVG Constants ─── */

const W = 800;
const H = 550;
const GRID_LEFT = 60;
const GRID_TOP = 80;
const CELL_SIZE = 40;
const POINT_RADIUS = 6;
const PANEL_X = 420;
const PANEL_Y = 80;
const PANEL_W = 350;

/* ─── Utility Functions ─── */

function checkLegality(dep: Dependence, transformType: TransformType): LegalityResult {
  const { di, dj } = dep;

  if (transformType === 'interchange') {
    // Loop interchange: (i,j) -> (j,i), T = [[0,1],[1,0]]
    // T·d = (dj, di)
    const td = [dj, di];
    const legal = td[0] > 0 || (td[0] === 0 && td[1] >= 0);
    return {
      legal,
      reason: {
        zh: `T·d = (${dj}, ${di}). ${legal ? '词典序非负，合法' : '词典序为负，非法'}。`,
        en: `T·d = (${dj}, ${di}). ${legal ? 'Lexicographically non-negative, legal' : 'Lexicographically negative, illegal'}.`,
      },
    };
  }

  if (transformType === 'tiling') {
    // Tiling preserves original order within tiles, legal if original is legal
    const legal = di > 0 || (di === 0 && dj >= 0);
    return {
      legal,
      reason: {
        zh: `Tiling保持tile内原始顺序，依赖向量(${di}, ${dj})${legal ? '合法' : '非法'}。`,
        en: `Tiling preserves order within tiles; dependence (${di}, ${dj}) is ${legal ? 'legal' : 'illegal'}.`,
      },
    };
  }

  if (transformType === 'skewing') {
    // Skewing: (i,j) -> (i, i+j), T = [[1,0],[1,1]]
    // T·d = (di, di+dj)
    const td = [di, di + dj];
    const legal = td[0] > 0 || (td[0] === 0 && td[1] >= 0);
    return {
      legal,
      reason: {
        zh: `T·d = (${di}, ${di + dj}). ${legal ? '词典序非负，合法' : '词典序为负，非法'}。`,
        en: `T·d = (${di}, ${di + dj}). ${legal ? 'Lexicographically non-negative, legal' : 'Lexicographically negative, illegal'}.`,
      },
    };
  }

  if (transformType === 'reverse') {
    // Reverse i loop: (i,j) -> (-i, j), T = [[-1,0],[0,1]]
    // T·d = (-di, dj)
    const td = [-di, dj];
    const legal = td[0] > 0 || (td[0] === 0 && td[1] >= 0);
    return {
      legal,
      reason: {
        zh: `T·d = (${-di}, ${dj}). ${legal ? '词典序非负，合法' : '词典序为负，非法'}。`,
        en: `T·d = (${-di}, ${dj}). ${legal ? 'Lexicographically non-negative, legal' : 'Lexicographically negative, illegal'}.`,
      },
    };
  }

  return { legal: true, reason: { zh: '', en: '' } };
}

/* ─── Component ─── */

export default function DependenceAnalysisDemo({ locale = 'zh' }: Props) {
  const [selectedScenario, setSelectedScenario] = useState<string>('flow_i');
  const [testedTransform, setTestedTransform] = useState<TransformType | null>(null);

  const t = {
    zh: {
      title: '依赖分析与变换合法性检查',
      subtitle: '迭代空间中的数据依赖可视化',
      scenarioLabel: '场景选择',
      code: '代码',
      dependences: '依赖向量',
      tryTransform: '尝试变换',
      legalityCheck: '合法性检查',
      legal: '合法',
      illegal: '非法',
      transforms: {
        interchange: '循环交换',
        tiling: 'Tiling',
        skewing: 'Skewing',
        reverse: '反向遍历',
      },
      noDep: '无依赖，所有变换均合法',
      vectorLabel: '依赖向量',
    },
    en: {
      title: 'Dependence Analysis & Transformation Legality',
      subtitle: 'Data dependence visualization in iteration space',
      scenarioLabel: 'Scenario',
      code: 'Code',
      dependences: 'Dependence Vectors',
      tryTransform: 'Try Transformation',
      legalityCheck: 'Legality Check',
      legal: 'Legal',
      illegal: 'Illegal',
      transforms: {
        interchange: 'Loop Interchange',
        tiling: 'Tiling',
        skewing: 'Skewing',
        reverse: 'Reverse Traversal',
      },
      noDep: 'No dependence, all transformations legal',
      vectorLabel: 'Dep Vector',
    },
  }[locale]!;

  const scenario = useMemo(() => SCENARIOS.find(s => s.id === selectedScenario)!, [selectedScenario]);

  const legalityResults = useMemo(() => {
    if (!testedTransform || scenario.dependences.length === 0) return null;
    return scenario.dependences.map(dep => checkLegality(dep, testedTransform));
  }, [scenario, testedTransform]);

  const renderDependenceArrows = () => {
    if (scenario.dependences.length === 0) return null;

    return scenario.dependences.map((dep, idx) => {
      const arrows = [];
      // Draw arrows for a few sample points
      const samplePoints = [
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 2],
      ];

      for (const [i, j] of samplePoints) {
        const sourceI = i - dep.di;
        const sourceJ = j - dep.dj;
        if (sourceI >= 0 && sourceI < SPACE_SIZE && sourceJ >= 0 && sourceJ < SPACE_SIZE) {
          const x1 = GRID_LEFT + sourceJ * CELL_SIZE;
          const y1 = GRID_TOP + sourceI * CELL_SIZE;
          const x2 = GRID_LEFT + j * CELL_SIZE;
          const y2 = GRID_TOP + i * CELL_SIZE;

          arrows.push(
            <g key={`${i}-${j}`}>
              <defs>
                <marker id={`dep-arrow-${idx}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,1 L7,4 L0,7" fill={COLORS.red} />
                </marker>
              </defs>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={COLORS.red}
                strokeWidth={2}
                markerEnd={`url(#dep-arrow-${idx})`}
                opacity={0.7}
              />
            </g>
          );
        }
      }

      return <g key={idx}>{arrows}</g>;
    });
  };

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Grid */}
        <g>
          {/* Axes */}
          <line
            x1={GRID_LEFT - 10}
            y1={GRID_TOP + SPACE_SIZE * CELL_SIZE + 10}
            x2={GRID_LEFT + SPACE_SIZE * CELL_SIZE + 10}
            y2={GRID_TOP + SPACE_SIZE * CELL_SIZE + 10}
            stroke={COLORS.mid}
            strokeWidth={1.5}
            markerEnd="url(#axis-arrow)"
          />
          <line
            x1={GRID_LEFT - 10}
            y1={GRID_TOP + SPACE_SIZE * CELL_SIZE + 10}
            x2={GRID_LEFT - 10}
            y2={GRID_TOP - 10}
            stroke={COLORS.mid}
            strokeWidth={1.5}
            markerEnd="url(#axis-arrow)"
          />
          <defs>
            <marker id="axis-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,1 L7,4 L0,7" fill={COLORS.mid} />
            </marker>
          </defs>
          <text x={GRID_LEFT + SPACE_SIZE * CELL_SIZE + 20} y={GRID_TOP + SPACE_SIZE * CELL_SIZE + 14} fontSize="11" fill={COLORS.mid} fontWeight="600">
            j
          </text>
          <text x={GRID_LEFT - 20} y={GRID_TOP - 14} fontSize="11" fill={COLORS.mid} fontWeight="600">
            i
          </text>

          {/* Points */}
          {Array.from({ length: SPACE_SIZE }, (_, i) =>
            Array.from({ length: SPACE_SIZE }, (_, j) => (
              <circle
                key={`${i}-${j}`}
                cx={GRID_LEFT + j * CELL_SIZE}
                cy={GRID_TOP + i * CELL_SIZE}
                r={POINT_RADIUS}
                fill={COLORS.light}
                stroke={COLORS.mid}
                strokeWidth={1}
                strokeOpacity={0.4}
              />
            ))
          )}

          {/* Dependence arrows */}
          {renderDependenceArrows()}
        </g>

        {/* Right panel */}
        <g>
          <rect x={PANEL_X} y={PANEL_Y} width={PANEL_W} height={440} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1.5} />

          {/* Scenario selector */}
          <text x={PANEL_X + 14} y={PANEL_Y + 26} fontSize="11" fontWeight="700" fill={COLORS.dark}>
            {t.scenarioLabel}
          </text>
          {SCENARIOS.map((sc, idx) => {
            const active = sc.id === selectedScenario;
            return (
              <g key={sc.id} transform={`translate(${PANEL_X + 14}, ${PANEL_Y + 40 + idx * 32})`}>
                <rect
                  x={0}
                  y={0}
                  width={PANEL_W - 28}
                  height={26}
                  rx={4}
                  fill={active ? COLORS.primary : COLORS.bg}
                  stroke={active ? COLORS.primary : COLORS.light}
                  strokeWidth={1}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedScenario(sc.id);
                    setTestedTransform(null);
                  }}
                />
                <text
                  x={(PANEL_W - 28) / 2}
                  y={14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight={active ? '700' : '400'}
                  fill={active ? COLORS.bg : COLORS.dark}
                  style={{ pointerEvents: 'none' }}
                >
                  {sc.name[locale]}
                </text>
              </g>
            );
          })}

          {/* Code display */}
          <g transform={`translate(${PANEL_X + 14}, ${PANEL_Y + 180})`}>
            <text x={0} y={0} fontSize="10" fontWeight="600" fill={COLORS.mid}>
              {t.code}:
            </text>
            <rect x={0} y={6} width={PANEL_W - 28} height={32} rx={4} fill="#1e1e2e" />
            <text x={8} y={26} fontSize="10" fill="#ccc" style={{ fontFamily: FONTS.mono }}>
              {scenario.code}
            </text>
          </g>

          {/* Dependence vectors */}
          <g transform={`translate(${PANEL_X + 14}, ${PANEL_Y + 230})`}>
            <text x={0} y={0} fontSize="10" fontWeight="600" fill={COLORS.mid}>
              {t.dependences}:
            </text>
            {scenario.dependences.length === 0 ? (
              <text x={0} y={20} fontSize="9" fill={COLORS.green} fontStyle="italic">
                {t.noDep}
              </text>
            ) : (
              scenario.dependences.map((dep, idx) => (
                <g key={idx} transform={`translate(0, ${20 + idx * 20})`}>
                  <circle cx={6} cy={0} r={4} fill={COLORS.red} />
                  <text x={16} y={4} fontSize="10" fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>
                    {t.vectorLabel} {dep.label}
                  </text>
                </g>
              ))
            )}
            {scenario.description && (
              <text x={0} y={60} fontSize="9" fill={COLORS.mid}>
                {scenario.description[locale]}
              </text>
            )}
          </g>

          {/* Transform buttons */}
          <g transform={`translate(${PANEL_X + 14}, ${PANEL_Y + 310})`}>
            <text x={0} y={0} fontSize="10" fontWeight="600" fill={COLORS.mid}>
              {t.tryTransform}:
            </text>
            {(['interchange', 'tiling', 'skewing', 'reverse'] as TransformType[]).map((tr, idx) => (
              <g key={tr} transform={`translate(${(idx % 2) * 160}, ${20 + Math.floor(idx / 2) * 34})`}>
                <rect
                  x={0}
                  y={0}
                  width={150}
                  height={28}
                  rx={4}
                  fill={testedTransform === tr ? COLORS.primary : COLORS.bg}
                  stroke={COLORS.primary}
                  strokeWidth={1}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTestedTransform(tr)}
                />
                <text
                  x={75}
                  y={15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight={testedTransform === tr ? '700' : '400'}
                  fill={testedTransform === tr ? COLORS.bg : COLORS.primary}
                  style={{ pointerEvents: 'none' }}
                >
                  {t.transforms[tr]}
                </text>
              </g>
            ))}
          </g>

          {/* Legality results */}
          {testedTransform && (
            <g transform={`translate(${PANEL_X + 14}, ${PANEL_Y + 400})`}>
              <text x={0} y={0} fontSize="10" fontWeight="700" fill={COLORS.dark}>
                {t.legalityCheck}:
              </text>
              {scenario.dependences.length === 0 ? (
                <g transform="translate(0, 12)">
                  <rect x={0} y={0} width={20} height={20} rx={4} fill={COLORS.green} fillOpacity={0.2} />
                  <text x={10} y={11} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700" fill={COLORS.green}>
                    ✓
                  </text>
                  <text x={26} y={11} fontSize="9" fill={COLORS.green} dominantBaseline="middle">
                    {t.legal}
                  </text>
                </g>
              ) : (
                legalityResults &&
                legalityResults.map((result, idx) => {
                  const isLegal = result.legal;
                  return (
                    <g key={idx} transform={`translate(0, ${12 + idx * 50})`}>
                      <rect x={0} y={0} width={PANEL_W - 28} height={44} rx={4} fill={isLegal ? COLORS.valid : COLORS.waste} />
                      <g transform="translate(8, 8)">
                        <rect x={0} y={0} width={20} height={20} rx={4} fill={isLegal ? COLORS.green : COLORS.red} fillOpacity={0.8} />
                        <text x={10} y={11} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="700" fill="#fff">
                          {isLegal ? '✓' : '✗'}
                        </text>
                      </g>
                      <text x={34} y={14} fontSize="9" fontWeight="700" fill={isLegal ? COLORS.green : COLORS.red}>
                        {isLegal ? t.legal : t.illegal}
                      </text>
                      <text x={8} y={32} fontSize="8" fill={COLORS.dark}>
                        {result.reason[locale]}
                      </text>
                    </g>
                  );
                })
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
