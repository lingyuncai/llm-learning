import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const QUERIES = ['写一首诗', '解释量子力学', '翻译这段话', '写排序算法', '总结这篇论文'];
const MODELS = ['GPT-4', 'Llama-70B', 'Llama-8B'];

const PREFERENCES: number[][] = [
  [0.3, 0.6, 0.8],
  [0.9, 0.5, 0.1],
  [0.2, 0.7, 0.9],
  [0.7, 0.6, 0.3],
  [0.8, 0.4, 0.2],
];

const QUERY_VECS: [number, number][] = [
  [0.2, 0.8], [0.9, 0.3], [0.1, 0.9], [0.6, 0.5], [0.8, 0.4],
];
const MODEL_VECS: [number, number][] = [
  [0.9, 0.2], [0.5, 0.6], [0.2, 0.9],
];

type ViewMode = 'matrix' | 'vectors' | 'scoring';

export default function MatrixFactorizationViz() {
  const [mode, setMode] = useState<ViewMode>('matrix');
  const [hoveredQuery, setHoveredQuery] = useState<number | null>(null);

  const W = 580, H = 380;

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y="25" textAnchor="middle" fontFamily={FONTS.sans}
              fontSize="16" fontWeight="600" fill={COLORS.dark}>
          Matrix Factorization 路由
        </text>

        {/* Mode tabs */}
        <g transform="translate(140, 40)">
          {(['matrix', 'vectors', 'scoring'] as ViewMode[]).map((m, i) => {
            const labels = { matrix: '偏好矩阵', vectors: '向量空间', scoring: '评分预测' };
            return (
              <g key={m}>
                <rect x={i * 105} y="0" width="95" height="28" rx="4"
                      fill={mode === m ? COLORS.primary : COLORS.bgAlt}
                      stroke={COLORS.primary} strokeWidth="1.5"
                      style={{ cursor: 'pointer' }} onClick={() => setMode(m)} />
                <text x={i * 105 + 47.5} y="19" textAnchor="middle"
                      fontFamily={FONTS.sans} fontSize="11"
                      fontWeight={mode === m ? "700" : "400"}
                      fill={mode === m ? '#fff' : COLORS.dark}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                  {labels[m]}
                </text>
              </g>
            );
          })}
        </g>

        {mode === 'matrix' && (
          <g transform="translate(100, 90)">
            {MODELS.map((m, c) => (
              <text key={`h-${c}`} x={120 + c * 80 + 40} y="0" textAnchor="middle"
                    fontFamily={FONTS.mono} fontSize="11" fontWeight="600" fill={COLORS.dark}>
                {m}
              </text>
            ))}
            {QUERIES.map((q, r) => (
              <g key={`row-${r}`}>
                <text x="110" y={20 + r * 40 + 25} textAnchor="end"
                      fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>{q}</text>
                {MODELS.map((_, c) => {
                  const val = PREFERENCES[r][c];
                  return (
                    <g key={`cell-${r}-${c}`}>
                      <rect x={120 + c * 80} y={20 + r * 40} width="70" height="32" rx="3"
                            fill={`rgba(21, 101, 192, ${val * 0.6})`}
                            stroke={COLORS.mid} strokeWidth="0.5" />
                      <text x={120 + c * 80 + 35} y={20 + r * 40 + 21} textAnchor="middle"
                            fontFamily={FONTS.mono} fontSize="12" fill={val > 0.5 ? '#fff' : COLORS.dark}>
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}
            <text x="200" y="240" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
              高分 → 偏好强模型 · 低分 → 弱模型即可胜任
            </text>
          </g>
        )}

        {mode === 'vectors' && (
          <g transform="translate(100, 85)">
            <rect x="0" y="0" width="250" height="250" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />
            <text x="125" y="-5" textAnchor="middle" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
              潜在向量空间 (2D 投影)
            </text>
            {QUERY_VECS.map(([x, y], i) => (
              <g key={`qv-${i}`} onMouseEnter={() => setHoveredQuery(i)} onMouseLeave={() => setHoveredQuery(null)}>
                <circle cx={x * 230 + 10} cy={(1 - y) * 230 + 10} r="8"
                        fill={COLORS.green} stroke="#fff" strokeWidth="2" style={{ cursor: 'pointer' }} />
                <text x={x * 230 + 22} y={(1 - y) * 230 + 14}
                      fontFamily={FONTS.sans} fontSize="9" fill={COLORS.green}>
                  Q{i}
                </text>
              </g>
            ))}
            {MODEL_VECS.map(([x, y], i) => (
              <g key={`mv-${i}`}>
                <rect x={x * 230 + 10 - 6} y={(1 - y) * 230 + 10 - 6} width="12" height="12" rx="2"
                      fill={COLORS.primary} stroke="#fff" strokeWidth="2" />
                <text x={x * 230 + 28} y={(1 - y) * 230 + 14}
                      fontFamily={FONTS.mono} fontSize="9" fontWeight="600" fill={COLORS.primary}>
                  {MODELS[i]}
                </text>
              </g>
            ))}
            <g transform="translate(270, 20)">
              <circle cx="8" cy="8" r="6" fill={COLORS.green} />
              <text x="20" y="12" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>Query 向量</text>
              <rect x="2" y="25" width="12" height="12" rx="2" fill={COLORS.primary} />
              <text x="20" y="35" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark}>Model 向量</text>
              <text x="0" y="60" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
                距离近 = 偏好匹配
              </text>
              <text x="0" y="75" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
                内积越大 = 越偏好
              </text>
            </g>
            {hoveredQuery !== null && (
              <g transform="translate(270, 120)">
                <text x="0" y="0" fontFamily={FONTS.sans} fontSize="11" fontWeight="600" fill={COLORS.dark}>
                  {QUERIES[hoveredQuery]}
                </text>
                {MODELS.map((m, mi) => (
                  <text key={mi} x="0" y={18 + mi * 16} fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
                    → {m}: {PREFERENCES[hoveredQuery][mi].toFixed(1)}
                  </text>
                ))}
              </g>
            )}
          </g>
        )}

        {mode === 'scoring' && (
          <g transform="translate(40, 90)">
            <text x="250" y="0" textAnchor="middle" fontFamily={FONTS.sans} fontSize="13" fontWeight="600" fill={COLORS.dark}>
              评分过程：query_vec · model_vec → score → 选模型
            </text>
            {QUERIES.map((q, i) => {
              const scores = MODELS.map((_, mi) => {
                const [qx, qy] = QUERY_VECS[i];
                const [mx, my] = MODEL_VECS[mi];
                return qx * mx + qy * my;
              });
              const maxIdx = scores.indexOf(Math.max(...scores));
              return (
                <g key={i} transform={`translate(0, ${20 + i * 48})`}>
                  <text x="0" y="15" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>{q}</text>
                  <text x="0" y="30" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
                    → {MODELS.map((m, mi) => `${m}: ${scores[mi].toFixed(2)}`).join(' | ')}
                  </text>
                  <text x="430" y="22" fontFamily={FONTS.sans} fontSize="11" fontWeight="700"
                        fill={maxIdx === 2 ? COLORS.green : maxIdx === 1 ? COLORS.orange : COLORS.red}>
                    → {MODELS[maxIdx]}
                  </text>
                </g>
              );
            })}
            <text x="250" y="270" textAnchor="middle" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              高分 query 路由到 GPT-4（红），低分 query 路由到 Llama-8B（绿）节省成本
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
