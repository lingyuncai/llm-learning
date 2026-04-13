import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
}

type KernelKey = 'matmul' | 'attention';
type SearchStrategy = 'grid' | 'random' | 'bayesian';

interface KernelConfig {
  label: { zh: string; en: string };
  peakTflops: number;
}

interface ParamOption {
  name: string;
  values: number[];
}

interface SearchResult {
  configsTested: number;
  bestTflops: number;
  relativeTime: number;
  visitedCells: [number, number][];
  bestCell: [number, number];
}

/* ─── Constants ─── */

const W = 800;
const H = 560;

const KERNELS: Record<KernelKey, KernelConfig> = {
  matmul: {
    label: { zh: 'MatMul (M=4096, N=4096, K=4096)', en: 'MatMul (M=4096, N=4096, K=4096)' },
    peakTflops: 312,
  },
  attention: {
    label: { zh: 'Attention (B=32, S=512, D=64)', en: 'Attention (B=32, S=512, D=64)' },
    peakTflops: 280,
  },
};

const PARAMS: ParamOption[] = [
  { name: 'BLOCK_M', values: [32, 64, 128, 256] },
  { name: 'BLOCK_N', values: [32, 64, 128, 256] },
  { name: 'BLOCK_K', values: [16, 32, 64] },
  { name: 'num_warps', values: [2, 4, 8] },
  { name: 'num_stages', values: [2, 3, 4, 5] },
];

/* ─── Precomputed performance lookup ─── */

function computeThroughput(
  kernel: KernelKey,
  blockM: number,
  blockN: number,
  blockK: number,
  numWarps: number,
  numStages: number,
): number {
  const peak = KERNELS[kernel].peakTflops;

  // Tile utilization: sweet spot at 128×128 for large matmul
  const optM = kernel === 'matmul' ? 128 : 64;
  const optN = kernel === 'matmul' ? 128 : 64;
  const distM = Math.abs(Math.log2(blockM / optM));
  const distN = Math.abs(Math.log2(blockN / optN));
  const tileEff = Math.max(0.3, 1.0 - 0.18 * distM - 0.18 * distN);

  // Too small blocks → low TC util
  const tcUtil = blockM >= 64 && blockN >= 64 ? 1.0 : 0.65;

  // Too large blocks → potential SMEM overflow / low occupancy
  const smemBytes = (blockM * blockK + blockK * blockN) * 2 * numStages;
  const smemLimit = 228 * 1024; // H100 SMEM
  const occupancyPenalty = smemBytes > smemLimit ? 0.45 : smemBytes > smemLimit * 0.75 ? 0.8 : 1.0;

  // Warp configuration
  const warpEff = numWarps === 4 ? 1.0 : numWarps === 8 ? 0.92 : 0.78;

  // Pipeline stages: helps memory-bound, too many hurts compute-bound
  const isMemBound = blockM <= 64 || blockN <= 64;
  const stageEff = isMemBound
    ? Math.min(1.0, 0.75 + 0.08 * numStages)
    : numStages <= 3
      ? 1.0
      : 1.0 - 0.05 * (numStages - 3);

  // Add some deterministic "noise" for realism
  const hash = ((blockM * 7 + blockN * 13 + blockK * 23 + numWarps * 37 + numStages * 41) % 100) / 100;
  const noise = 0.95 + 0.1 * hash;

  const eff = tileEff * tcUtil * occupancyPenalty * warpEff * stageEff * noise;
  return Math.round(peak * Math.min(1.0, Math.max(0.15, eff)) * 10) / 10;
}

/* ─── Heatmap color ─── */

function heatColor(value: number, min: number, max: number): string {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  // green (good) → yellow → red (bad)
  const r = t < 0.5 ? Math.round(255 * (t * 2)) : 255;
  const g = t < 0.5 ? 255 : Math.round(255 * (1 - (t - 0.5) * 2));
  // Reverse: high throughput = green, low = red
  return `rgb(${255 - r + 50}, ${255 - g + 100}, 60)`;
}

function goodHeatColor(value: number, min: number, max: number): string {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  // low=red, high=green
  if (t < 0.33) {
    return `rgb(220, ${Math.round(80 + 100 * (t / 0.33))}, 60)`;
  } else if (t < 0.66) {
    const s = (t - 0.33) / 0.33;
    return `rgb(${Math.round(220 - 100 * s)}, ${Math.round(180 + 40 * s)}, 60)`;
  } else {
    const s = (t - 0.66) / 0.34;
    return `rgb(${Math.round(120 - 70 * s)}, ${Math.round(220 - 30 * s)}, ${Math.round(60 + 40 * s)})`;
  }
}

/* ─── Component ─── */

export default function AutotuneExplorer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '自动调优搜索空间探索器',
      kernel: '选择 Kernel',
      params: '参数配置',
      heatmap: '性能热力图 (TFLOPS)',
      heatmapSub: 'BLOCK_M × BLOCK_N（其余参数固定）',
      search: '搜索策略',
      grid: '网格搜索',
      random: '随机搜索',
      bayesian: '贝叶斯优化',
      gridDesc: '穷举所有组合，保证全局最优',
      randomDesc: '随机采样 30 个配置',
      bayesianDesc: '5 个初始点 + 高斯过程引导',
      currentThroughput: '当前吞吐',
      bestFound: '最优发现',
      ofPeak: '峰值占比',
      configsTested: '已测试',
      totalConfigs: '总配置数',
      tflops: 'TFLOPS',
      run: '运行',
      reset: '重置',
      running: '搜索中...',
      best: '最优',
    },
    en: {
      title: 'Autotune Search Space Explorer',
      kernel: 'Select Kernel',
      params: 'Parameters',
      heatmap: 'Performance Heatmap (TFLOPS)',
      heatmapSub: 'BLOCK_M × BLOCK_N (other params fixed)',
      search: 'Search Strategy',
      grid: 'Grid Search',
      random: 'Random Search',
      bayesian: 'Bayesian Opt.',
      gridDesc: 'Exhaustive, guarantees global optimum',
      randomDesc: 'Random sample 30 configs',
      bayesianDesc: '5 initial + GP-guided exploration',
      currentThroughput: 'Current',
      bestFound: 'Best Found',
      ofPeak: '% of Peak',
      configsTested: 'Tested',
      totalConfigs: 'Total configs',
      tflops: 'TFLOPS',
      run: 'Run',
      reset: 'Reset',
      running: 'Searching...',
      best: 'Best',
    },
  }[locale]!;

  const [kernel, setKernel] = useState<KernelKey>('matmul');
  const [paramIndices, setParamIndices] = useState([2, 2, 1, 1, 1]); // default: 128,128,32,4,3
  const [searchStrategy, setSearchStrategy] = useState<SearchStrategy | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const paramValues = paramIndices.map((idx, i) => PARAMS[i].values[idx]);
  const [blockM, blockN, blockK, numWarps, numStages] = paramValues;

  const currentTflops = useMemo(
    () => computeThroughput(kernel, blockM, blockN, blockK, numWarps, numStages),
    [kernel, blockM, blockN, blockK, numWarps, numStages],
  );

  // Generate heatmap grid (BLOCK_M × BLOCK_N)
  const heatmapData = useMemo(() => {
    const blockMs = PARAMS[0].values;
    const blockNs = PARAMS[1].values;
    const grid: { m: number; n: number; tflops: number }[][] = [];
    let min = Infinity, max = -Infinity;
    for (let mi = 0; mi < blockMs.length; mi++) {
      const row: { m: number; n: number; tflops: number }[] = [];
      for (let ni = 0; ni < blockNs.length; ni++) {
        const val = computeThroughput(kernel, blockMs[mi], blockNs[ni], blockK, numWarps, numStages);
        row.push({ m: blockMs[mi], n: blockNs[ni], tflops: val });
        min = Math.min(min, val);
        max = Math.max(max, val);
      }
      grid.push(row);
    }
    // Find best
    let bestM = 0, bestN = 0, bestVal = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell.tflops > bestVal) {
          bestVal = cell.tflops;
          bestM = PARAMS[0].values.indexOf(cell.m);
          bestN = PARAMS[1].values.indexOf(cell.n);
        }
      }
    }
    return { grid, min, max, bestM, bestN, bestVal };
  }, [kernel, blockK, numWarps, numStages]);

  const totalConfigs = PARAMS.reduce((acc, p) => acc * p.values.length, 1);

  const changeParam = useCallback((paramIdx: number, delta: number) => {
    setParamIndices(prev => {
      const newIndices = [...prev];
      const len = PARAMS[paramIdx].values.length;
      newIndices[paramIdx] = Math.max(0, Math.min(len - 1, newIndices[paramIdx] + delta));
      return newIndices;
    });
  }, []);

  const runSearch = useCallback((strategy: SearchStrategy) => {
    setSearchStrategy(strategy);
    setIsSearching(true);

    const blockMs = PARAMS[0].values;
    const blockNs = PARAMS[1].values;
    const visited: [number, number][] = [];
    let bestTflops = 0;
    let bestCell: [number, number] = [0, 0];

    if (strategy === 'grid') {
      // Visit all cells
      for (let mi = 0; mi < blockMs.length; mi++) {
        for (let ni = 0; ni < blockNs.length; ni++) {
          visited.push([mi, ni]);
          const val = computeThroughput(kernel, blockMs[mi], blockNs[ni], blockK, numWarps, numStages);
          if (val > bestTflops) {
            bestTflops = val;
            bestCell = [mi, ni];
          }
        }
      }
      setSearchResult({
        configsTested: totalConfigs,
        bestTflops,
        relativeTime: 1.0,
        visitedCells: visited,
        bestCell,
      });
    } else if (strategy === 'random') {
      // Random 8 out of 16 cells (in heatmap view)
      const allCells: [number, number][] = [];
      for (let mi = 0; mi < blockMs.length; mi++)
        for (let ni = 0; ni < blockNs.length; ni++)
          allCells.push([mi, ni]);
      // Deterministic shuffle via seed
      const shuffled = [...allCells].sort((a, b) => {
        const ha = (a[0] * 7 + a[1] * 13) % 17;
        const hb = (b[0] * 7 + b[1] * 13) % 17;
        return ha - hb;
      });
      const sampled = shuffled.slice(0, 8);
      for (const [mi, ni] of sampled) {
        visited.push([mi, ni]);
        const val = computeThroughput(kernel, blockMs[mi], blockNs[ni], blockK, numWarps, numStages);
        if (val > bestTflops) {
          bestTflops = val;
          bestCell = [mi, ni];
        }
      }
      setSearchResult({
        configsTested: 30,
        bestTflops,
        relativeTime: 0.3,
        visitedCells: visited,
        bestCell,
      });
    } else {
      // Bayesian: 3 initial random + focus near best
      const initial: [number, number][] = [[0, 0], [3, 3], [1, 2]];
      let localBest: [number, number] = [0, 0];
      for (const [mi, ni] of initial) {
        visited.push([mi, ni]);
        const val = computeThroughput(kernel, blockMs[mi], blockNs[ni], blockK, numWarps, numStages);
        if (val > bestTflops) {
          bestTflops = val;
          localBest = [mi, ni];
        }
      }
      // Explore neighbors of best
      const neighbors: [number, number][] = [
        [Math.max(0, localBest[0] - 1), localBest[1]],
        [Math.min(3, localBest[0] + 1), localBest[1]],
        [localBest[0], Math.max(0, localBest[1] - 1)],
        [localBest[0], Math.min(3, localBest[1] + 1)],
        [Math.max(0, localBest[0] - 1), Math.max(0, localBest[1] - 1)],
      ];
      for (const [mi, ni] of neighbors) {
        if (!visited.some(v => v[0] === mi && v[1] === ni)) {
          visited.push([mi, ni]);
          const val = computeThroughput(kernel, blockMs[mi], blockNs[ni], blockK, numWarps, numStages);
          if (val > bestTflops) {
            bestTflops = val;
            bestCell = [mi, ni];
          }
        }
      }
      if (bestCell[0] === 0 && bestCell[1] === 0 && bestTflops > 0) bestCell = localBest;
      setSearchResult({
        configsTested: 12,
        bestTflops,
        relativeTime: 0.15,
        visitedCells: visited,
        bestCell,
      });
    }

    setIsSearching(false);
  }, [kernel, blockK, numWarps, numStages, totalConfigs]);

  const resetSearch = useCallback(() => {
    setSearchResult(null);
    setSearchStrategy(null);
  }, []);

  // Layout constants
  const paramX = 20;
  const paramW = 180;
  const heatX = 215;
  const heatW = 360;
  const searchX = 590;
  const searchW = 195;

  const cellSize = 80;
  const heatGridX = heatX + 40;
  const heatGridY = 115;

  const curMi = paramIndices[0];
  const curNi = paramIndices[1];

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; } .mono { font-family: ${FONTS.mono}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* ─── Kernel Selector ─── */}
        <rect x={paramX} y={36} width={W - 40} height={32} rx={4} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
        <text x={paramX + 8} y={56} fontSize="11" fontWeight="600" fill={COLORS.mid}>{t.kernel}:</text>
        {(['matmul', 'attention'] as KernelKey[]).map((k, i) => {
          const bx = paramX + 90 + i * 340;
          const isActive = kernel === k;
          return (
            <g key={k} onClick={() => { setKernel(k); resetSearch(); }} style={{ cursor: 'pointer' }}>
              <rect x={bx} y={40} width={320} height={24} rx={4}
                fill={isActive ? COLORS.primary : 'white'}
                stroke={isActive ? COLORS.primary : COLORS.light}
                strokeWidth={1} />
              <text x={bx + 160} y={56} textAnchor="middle" fontSize="11"
                fontWeight={isActive ? '700' : '400'}
                fill={isActive ? 'white' : COLORS.mid}
                className="mono">
                {KERNELS[k].label[locale]}
              </text>
            </g>
          );
        })}

        {/* ─── Parameter Panel (left) ─── */}
        <rect x={paramX} y={78} width={paramW} height={370} rx={6} fill="white" stroke={COLORS.light} strokeWidth={1} />
        <text x={paramX + paramW / 2} y={98} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.dark}>
          {t.params}
        </text>

        {PARAMS.map((param, pi) => {
          const py = 112 + pi * 68;
          const currentVal = param.values[paramIndices[pi]];
          return (
            <g key={param.name}>
              <text x={paramX + 12} y={py + 14} fontSize="10" fontWeight="600" fill={COLORS.mid}>
                {param.name}
              </text>
              <text x={paramX + paramW - 12} y={py + 14} textAnchor="end" fontSize="13" fontWeight="700"
                fill={COLORS.primary} className="mono">
                {currentVal}
              </text>
              {/* -/+ buttons */}
              <g onClick={() => changeParam(pi, -1)} style={{ cursor: paramIndices[pi] > 0 ? 'pointer' : 'default' }}>
                <rect x={paramX + 12} y={py + 22} width={30} height={24} rx={4}
                  fill={paramIndices[pi] > 0 ? COLORS.bgAlt : COLORS.masked}
                  stroke={COLORS.light} strokeWidth={1} />
                <text x={paramX + 27} y={py + 38} textAnchor="middle" fontSize="14" fontWeight="700"
                  fill={paramIndices[pi] > 0 ? COLORS.dark : COLORS.mid}>
                  -
                </text>
              </g>
              {/* Value indicator bar */}
              <rect x={paramX + 48} y={py + 28} width={paramW - 90} height={12} rx={3} fill={COLORS.masked} />
              <rect x={paramX + 48} y={py + 28}
                width={Math.max(8, ((paramW - 90) * paramIndices[pi]) / Math.max(1, param.values.length - 1))}
                height={12} rx={3} fill={COLORS.primary} fillOpacity={0.6} />
              <g onClick={() => changeParam(pi, 1)}
                style={{ cursor: paramIndices[pi] < param.values.length - 1 ? 'pointer' : 'default' }}>
                <rect x={paramX + paramW - 42} y={py + 22} width={30} height={24} rx={4}
                  fill={paramIndices[pi] < param.values.length - 1 ? COLORS.bgAlt : COLORS.masked}
                  stroke={COLORS.light} strokeWidth={1} />
                <text x={paramX + paramW - 27} y={py + 38} textAnchor="middle" fontSize="14" fontWeight="700"
                  fill={paramIndices[pi] < param.values.length - 1 ? COLORS.dark : COLORS.mid}>
                  +
                </text>
              </g>
              {/* Show all options */}
              <g>
                {param.values.map((v, vi) => {
                  const vx = paramX + 12 + vi * ((paramW - 24) / param.values.length);
                  return (
                    <text key={vi} x={vx + (paramW - 24) / param.values.length / 2} y={py + 58}
                      textAnchor="middle" fontSize="8" fill={vi === paramIndices[pi] ? COLORS.primary : COLORS.mid}
                      fontWeight={vi === paramIndices[pi] ? '700' : '400'} className="mono">
                      {v}
                    </text>
                  );
                })}
              </g>
            </g>
          );
        })}

        {/* ─── Performance Heatmap (center) ─── */}
        <rect x={heatX} y={78} width={heatW} height={370} rx={6} fill="white" stroke={COLORS.light} strokeWidth={1} />
        <text x={heatX + heatW / 2} y={98} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.dark}>
          {t.heatmap}
        </text>
        <text x={heatX + heatW / 2} y={112} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.heatmapSub}
        </text>

        {/* Y-axis label: BLOCK_N */}
        <text x={heatX + 10} y={heatGridY + cellSize * 2} textAnchor="middle" fontSize="9" fontWeight="600"
          fill={COLORS.mid} transform={`rotate(-90, ${heatX + 10}, ${heatGridY + cellSize * 2})`}>
          BLOCK_N
        </text>

        {/* X-axis label: BLOCK_M */}
        <text x={heatGridX + cellSize * 2} y={heatGridY + cellSize * 4 + 18} textAnchor="middle"
          fontSize="9" fontWeight="600" fill={COLORS.mid}>
          BLOCK_M
        </text>

        {/* X-axis values */}
        {PARAMS[0].values.map((v, i) => (
          <text key={i} x={heatGridX + i * cellSize + cellSize / 2} y={heatGridY - 5}
            textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.mid} className="mono">
            {v}
          </text>
        ))}

        {/* Y-axis values */}
        {PARAMS[1].values.map((v, i) => (
          <text key={i} x={heatGridX - 8} y={heatGridY + i * cellSize + cellSize / 2 + 3}
            textAnchor="end" fontSize="9" fontWeight="600" fill={COLORS.mid} className="mono">
            {v}
          </text>
        ))}

        {/* Heatmap cells */}
        {heatmapData.grid.map((row, mi) =>
          row.map((cell, ni) => {
            const cx = heatGridX + mi * cellSize;
            const cy = heatGridY + ni * cellSize;
            const isCurrent = mi === curMi && ni === curNi;
            const isBest = mi === heatmapData.bestM && ni === heatmapData.bestN;
            const isVisited = searchResult?.visitedCells.some(v => v[0] === mi && v[1] === ni);
            const isSearchBest = searchResult
              ? mi === searchResult.bestCell[0] && ni === searchResult.bestCell[1]
              : false;
            return (
              <g key={`${mi}-${ni}`}
                onClick={() => {
                  setParamIndices(prev => {
                    const next = [...prev];
                    next[0] = mi;
                    next[1] = ni;
                    return next;
                  });
                }}
                style={{ cursor: 'pointer' }}>
                <rect x={cx + 1} y={cy + 1} width={cellSize - 2} height={cellSize - 2} rx={4}
                  fill={goodHeatColor(cell.tflops, heatmapData.min, heatmapData.max)}
                  fillOpacity={searchResult ? (isVisited ? 1.0 : 0.25) : 1.0}
                  stroke={isCurrent ? COLORS.dark : isSearchBest ? COLORS.purple : 'white'}
                  strokeWidth={isCurrent ? 2.5 : isSearchBest ? 2.5 : 0.5} />
                <text x={cx + cellSize / 2} y={cy + cellSize / 2 - 4}
                  textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.dark} className="mono">
                  {cell.tflops.toFixed(0)}
                </text>
                <text x={cx + cellSize / 2} y={cy + cellSize / 2 + 10}
                  textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                  {t.tflops}
                </text>
                {isBest && !searchResult && (
                  <text x={cx + cellSize - 8} y={cy + 16} textAnchor="middle" fontSize="14" fill={COLORS.orange}>
                    ★
                  </text>
                )}
                {isSearchBest && searchResult && (
                  <text x={cx + cellSize - 8} y={cy + 16} textAnchor="middle" fontSize="14" fill={COLORS.purple}>
                    ★
                  </text>
                )}
              </g>
            );
          }),
        )}

        {/* ─── Search Strategy Panel (right) ─── */}
        <rect x={searchX} y={78} width={searchW} height={370} rx={6} fill="white" stroke={COLORS.light} strokeWidth={1} />
        <text x={searchX + searchW / 2} y={98} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.dark}>
          {t.search}
        </text>

        {/* Strategy buttons */}
        {([
          { key: 'grid' as SearchStrategy, label: t.grid, desc: t.gridDesc, color: COLORS.primary },
          { key: 'random' as SearchStrategy, label: t.random, desc: t.randomDesc, color: COLORS.green },
          { key: 'bayesian' as SearchStrategy, label: t.bayesian, desc: t.bayesianDesc, color: COLORS.purple },
        ]).map((s, i) => {
          const by = 110 + i * 90;
          const isActive = searchStrategy === s.key;
          return (
            <g key={s.key}>
              <g onClick={() => runSearch(s.key)} style={{ cursor: 'pointer' }}>
                <rect x={searchX + 10} y={by} width={searchW - 20} height={28} rx={5}
                  fill={isActive ? s.color : COLORS.bgAlt}
                  stroke={s.color} strokeWidth={1.5} />
                <text x={searchX + searchW / 2} y={by + 18} textAnchor="middle" fontSize="11" fontWeight="700"
                  fill={isActive ? 'white' : s.color}>
                  {s.label}
                </text>
              </g>
              <text x={searchX + 14} y={by + 44} fontSize="8.5" fill={COLORS.mid}>
                {s.desc}
              </text>
              {isActive && searchResult && (
                <g>
                  <text x={searchX + 14} y={by + 58} fontSize="9" fill={COLORS.dark} fontWeight="600">
                    {t.best}: {searchResult.bestTflops.toFixed(1)} {t.tflops}
                  </text>
                  <text x={searchX + 14} y={by + 72} fontSize="9" fill={COLORS.mid}>
                    {t.configsTested}: {searchResult.configsTested} | {(searchResult.relativeTime * 100).toFixed(0)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Reset button */}
        <g onClick={resetSearch} style={{ cursor: 'pointer' }}>
          <rect x={searchX + 10} y={392} width={searchW - 20} height={26} rx={5}
            fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1} />
          <text x={searchX + searchW / 2} y={409} textAnchor="middle" fontSize="11" fontWeight="600"
            fill={COLORS.red}>
            {t.reset}
          </text>
        </g>

        {/* ─── Bottom Metrics Bar ─── */}
        <rect x={20} y={458} width={W - 40} height={50} rx={6} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

        {/* Current throughput */}
        <text x={60} y={476} textAnchor="middle" fontSize="9" fill={COLORS.mid}>{t.currentThroughput}</text>
        <text x={60} y={498} textAnchor="middle" fontSize="16" fontWeight="700" fill={COLORS.primary} className="mono">
          {currentTflops.toFixed(1)}
        </text>

        {/* Best found */}
        <text x={200} y={476} textAnchor="middle" fontSize="9" fill={COLORS.mid}>{t.bestFound}</text>
        <text x={200} y={498} textAnchor="middle" fontSize="16" fontWeight="700" fill={COLORS.green} className="mono">
          {searchResult ? searchResult.bestTflops.toFixed(1) : heatmapData.bestVal.toFixed(1)}
        </text>

        {/* % of peak */}
        <text x={340} y={476} textAnchor="middle" fontSize="9" fill={COLORS.mid}>{t.ofPeak}</text>
        <text x={340} y={498} textAnchor="middle" fontSize="16" fontWeight="700" fill={COLORS.orange} className="mono">
          {((currentTflops / KERNELS[kernel].peakTflops) * 100).toFixed(1)}%
        </text>

        {/* Configs tested */}
        <text x={500} y={476} textAnchor="middle" fontSize="9" fill={COLORS.mid}>{t.configsTested}</text>
        <text x={500} y={498} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark} className="mono">
          {searchResult ? searchResult.configsTested : '-'} / {totalConfigs}
        </text>

        {/* Total configs */}
        <text x={660} y={476} textAnchor="middle" fontSize="9" fill={COLORS.mid}>{t.totalConfigs}</text>
        <text x={660} y={498} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.mid} className="mono">
          {PARAMS[0].values.length} × {PARAMS[1].values.length} × {PARAMS[2].values.length} × {PARAMS[3].values.length} × {PARAMS[4].values.length} = {totalConfigs}
        </text>

        {/* ─── Legend ─── */}
        <rect x={20} y={518} width={W - 40} height={32} rx={4} fill="white" stroke={COLORS.light} strokeWidth={0.5} />
        <rect x={40} y={527} width={14} height={14} rx={2} fill={goodHeatColor(1, 0, 1)} />
        <text x={60} y={538} fontSize="9" fill={COLORS.mid}>High TFLOPS</text>
        <rect x={150} y={527} width={14} height={14} rx={2} fill={goodHeatColor(0.5, 0, 1)} />
        <text x={170} y={538} fontSize="9" fill={COLORS.mid}>Medium</text>
        <rect x={240} y={527} width={14} height={14} rx={2} fill={goodHeatColor(0, 0, 1)} />
        <text x={260} y={538} fontSize="9" fill={COLORS.mid}>Low</text>
        <rect x={330} y={527} width={14} height={14} rx={2} fill="white" stroke={COLORS.dark} strokeWidth={2} />
        <text x={350} y={538} fontSize="9" fill={COLORS.mid}>{locale === 'zh' ? '当前选择' : 'Current'}</text>
        <text x={440} y={538} fontSize="13" fill={COLORS.orange}>★</text>
        <text x={458} y={538} fontSize="9" fill={COLORS.mid}>{locale === 'zh' ? '全局最优' : 'Global Best'}</text>
        <text x={550} y={538} fontSize="13" fill={COLORS.purple}>★</text>
        <text x={568} y={538} fontSize="9" fill={COLORS.mid}>{locale === 'zh' ? '搜索最优' : 'Search Best'}</text>
      </svg>
    </div>
  );
}
