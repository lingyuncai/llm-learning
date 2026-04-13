import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Constants ─── */

const W = 800;
const H = 600;

const SEQ_OPTIONS = [512, 1024, 2048, 4096, 8192];
const SRAM_MIN = 48;
const SRAM_MAX = 228;
const HEAD_DIM = 64;

/* ─── Helpers ─── */

function standardHBMAccessMB(N: number, d: number): number {
  // Load Q (N*d) + Load K (N*d) + Write S (N*N) + Load S (N*N) + Write softmax(S) (N*N)
  // + Load softmax(S) (N*N) + Load V (N*d) + Write O (N*d)
  // = 4*N*d + 4*N*N  (all in FP16 = 2 bytes)
  const bytes = (4 * N * d + 4 * N * N) * 2;
  return bytes / (1024 * 1024);
}

function flashHBMAccessMB(N: number, d: number, sramKB: number): number {
  // O(N^2 * d^2 / M) where M = sramKB * 1024 bytes
  // Exact: each outer loop loads Q tile (Br*d), inner loop loads K/V tiles (Bc*d)
  // Br = Bc = floor(M / (4*d*2)) where *2 for FP16
  const M = sramKB * 1024;
  const tileRows = Math.max(1, Math.floor(M / (4 * d * 2)));
  const numTilesRow = Math.ceil(N / tileRows);
  const numTilesCol = Math.ceil(N / tileRows);
  // Per outer iter: load Q_tile (tileRows*d*2), per inner: load K_tile + V_tile (2*tileRows*d*2)
  // Write O_tile once per outer (tileRows*d*2)
  const bytesPerOuter = tileRows * d * 2 + numTilesCol * 2 * tileRows * d * 2 + tileRows * d * 2;
  const totalBytes = numTilesRow * bytesPerOuter;
  return totalBytes / (1024 * 1024);
}

function getTileSize(sramKB: number, d: number): number {
  const M = sramKB * 1024;
  return Math.max(1, Math.floor(M / (4 * d * 2)));
}

/* ─── Component ─── */

export default function FlashAttentionDeepDive({ locale = 'zh' }: Props) {
  const [seqIdx, setSeqIdx] = useState(2); // default 2048
  const [sramKB, setSramKB] = useState(164); // A100 default
  const [animTileRow, setAnimTileRow] = useState(0);
  const [animTileCol, setAnimTileCol] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const N = SEQ_OPTIONS[seqIdx];
  const d = HEAD_DIM;
  const tileSize = getTileSize(sramKB, d);
  const numTiles = Math.ceil(N / tileSize);

  // Display grid: use representational size
  const GRID_CELLS = Math.min(numTiles, 16);

  const stdHBM = standardHBMAccessMB(N, d);
  const flashHBM = flashHBMAccessMB(N, d, sramKB);
  const savings = ((1 - flashHBM / stdHBM) * 100);

  const t = {
    zh: {
      title: 'FlashAttention 深度剖析',
      seqLen: '序列长度 N',
      sram: 'SRAM 大小',
      standard: '标准 Attention',
      flash: 'FlashAttention',
      scoreMatrix: '分数矩阵 S = QK^T',
      allInHBM: '整个 N×N 矩阵在 HBM 中',
      tileInSRAM: '仅 tile 在 SRAM 中',
      hbmAccess: 'HBM 访问量',
      savings: '节省',
      tileSize: 'Tile 大小',
      nxn: `${N}×${N}`,
      matSize: `${(N * N * 2 / 1024 / 1024).toFixed(1)} MB`,
      play: '播放',
      pause: '暂停',
      memFlow: '内存访问流程',
      stdSteps: ['读 Q', '读 K', '写 S 到 HBM', '读 S', '写 softmax(S)', '读 V', '写 O'],
      flashSteps: ['加载 Q tile', '加载 K,V tile', 'SRAM 计算', '更新累加器', '写 O tile'],
      ioComplexity: 'I/O 复杂度',
      stdComplexity: 'O(Nd + N^2)',
      flashComplexity: 'O(N^2d^2/M)',
    },
    en: {
      title: 'FlashAttention Deep Dive',
      seqLen: 'Sequence Length N',
      sram: 'SRAM Size',
      standard: 'Standard Attention',
      flash: 'FlashAttention',
      scoreMatrix: 'Score Matrix S = QK^T',
      allInHBM: 'Entire N×N matrix in HBM',
      tileInSRAM: 'Only tile in SRAM',
      hbmAccess: 'HBM Access',
      savings: 'Savings',
      tileSize: 'Tile Size',
      nxn: `${N}×${N}`,
      matSize: `${(N * N * 2 / 1024 / 1024).toFixed(1)} MB`,
      play: 'Play',
      pause: 'Pause',
      memFlow: 'Memory Access Flow',
      stdSteps: ['Read Q', 'Read K', 'Write S to HBM', 'Read S', 'Write softmax(S)', 'Read V', 'Write O'],
      flashSteps: ['Load Q tile', 'Load K,V tile', 'Compute in SRAM', 'Update accum.', 'Write O tile'],
      ioComplexity: 'I/O Complexity',
      stdComplexity: 'O(Nd + N\u00B2)',
      flashComplexity: 'O(N\u00B2d\u00B2/M)',
    },
  }[locale]!;

  // Animation
  const advanceTile = useCallback(() => {
    setAnimTileCol(prev => {
      if (prev + 1 < GRID_CELLS) return prev + 1;
      setAnimTileRow(prevRow => (prevRow + 1) % GRID_CELLS);
      return 0;
    });
  }, [GRID_CELLS]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(advanceTile, 400);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, advanceTile]);

  // Reset animation when params change
  useEffect(() => {
    setAnimTileRow(0);
    setAnimTileCol(0);
  }, [seqIdx, sramKB]);

  // Grid rendering
  const panelW = 360;
  const gridSize = 140;
  const cellSize = gridSize / GRID_CELLS;

  const stdGridX = 30;
  const flashGridX = W / 2 + 20;
  const gridY = 180;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; } .clickable { cursor: pointer; }`}</style>

        {/* Title */}
        <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Controls */}
        <g transform="translate(30, 36)">
          <text x={0} y={14} fontSize="10" fontWeight="600" fill={COLORS.mid}>{t.seqLen}:</text>
          {SEQ_OPTIONS.map((n, i) => {
            const bx = 110 + i * 62;
            const isActive = seqIdx === i;
            return (
              <g key={n} className="clickable" onClick={() => setSeqIdx(i)}>
                <rect x={bx} y={0} width={54} height={22} rx={11}
                  fill={isActive ? COLORS.primary : COLORS.bgAlt}
                  stroke={isActive ? COLORS.primary : COLORS.light} strokeWidth={1.5} />
                <text x={bx + 27} y={15} textAnchor="middle" fontSize="9" fontWeight="600"
                  fill={isActive ? '#fff' : COLORS.dark} style={{ fontFamily: FONTS.mono }}>
                  {n}
                </text>
              </g>
            );
          })}
        </g>

        <g transform="translate(30, 66)">
          <text x={0} y={14} fontSize="10" fontWeight="600" fill={COLORS.mid}>{t.sram}:</text>
          <text x={110} y={14} fontSize="9" fontWeight="600" fill={COLORS.primary} style={{ fontFamily: FONTS.mono }}>
            {sramKB} KB
          </text>
          {/* Slider track */}
          <rect x={170} y={6} width={200} height={8} rx={4} fill={COLORS.light} />
          <rect x={170} y={6} width={((sramKB - SRAM_MIN) / (SRAM_MAX - SRAM_MIN)) * 200} height={8} rx={4}
            fill={COLORS.primary} fillOpacity={0.4} />
          {/* Slider hitbox */}
          <rect x={170} y={0} width={200} height={22} fill="transparent" className="clickable"
            onClick={(e) => {
              const rect = (e.target as SVGRectElement).getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setSramKB(Math.round(SRAM_MIN + pct * (SRAM_MAX - SRAM_MIN)));
            }} />
          {/* Preset labels */}
          <text x={170} y={28} fontSize="7" fill={COLORS.mid}>{SRAM_MIN}KB</text>
          <text x={370} y={28} textAnchor="end" fontSize="7" fill={COLORS.mid}>{SRAM_MAX}KB</text>

          {/* Tile size info */}
          <text x={400} y={14} fontSize="9" fill={COLORS.mid}>
            {t.tileSize}: <tspan fontWeight="600" fill={COLORS.dark} style={{ fontFamily: FONTS.mono }}>{tileSize}</tspan> rows
          </text>

          {/* Play/pause */}
          <g className="clickable" onClick={() => setIsPlaying(!isPlaying)}>
            <rect x={580} y={0} width={60} height={22} rx={11}
              fill={isPlaying ? COLORS.green : COLORS.mid} fillOpacity={0.15}
              stroke={isPlaying ? COLORS.green : COLORS.mid} strokeWidth={1} />
            <text x={610} y={15} textAnchor="middle" fontSize="9" fontWeight="600"
              fill={isPlaying ? COLORS.green : COLORS.mid}>
              {isPlaying ? t.pause : t.play}
            </text>
          </g>
        </g>

        {/* Divider */}
        <line x1={W / 2} y1={100} x2={W / 2} y2={H - 10} stroke={COLORS.light} strokeWidth={1.5} strokeDasharray="4,4" />

        {/* ─── Standard Attention Panel ─── */}
        <text x={stdGridX + panelW / 2} y={118} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.red}>
          {t.standard}
        </text>
        <text x={stdGridX + panelW / 2} y={134} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.scoreMatrix} [{t.nxn}] = {t.matSize}
        </text>

        {/* Standard grid: all red (entire matrix in HBM) */}
        <g transform={`translate(${stdGridX + 20}, ${gridY})`}>
          {Array.from({ length: GRID_CELLS }).map((_, r) =>
            Array.from({ length: GRID_CELLS }).map((_, c) => (
              <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize}
                width={cellSize - 1} height={cellSize - 1} rx={1}
                fill={COLORS.red} fillOpacity={0.3}
                stroke={COLORS.red} strokeWidth={0.5} strokeOpacity={0.4} />
            ))
          )}
          <text x={gridSize / 2} y={gridSize + 14} textAnchor="middle" fontSize="8" fill={COLORS.red}>
            {t.allInHBM}
          </text>
          {/* Axis labels */}
          <text x={gridSize / 2} y={-6} textAnchor="middle" fontSize="7" fill={COLORS.mid}>K (N={N})</text>
          <text x={-10} y={gridSize / 2} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            transform={`rotate(-90, -10, ${gridSize / 2})`}>Q (N={N})</text>
        </g>

        {/* Standard memory flow */}
        <g transform={`translate(${stdGridX + gridSize + 50}, ${gridY})`}>
          <text x={0} y={0} fontSize="9" fontWeight="600" fill={COLORS.dark}>{t.memFlow}:</text>
          {t.stdSteps.map((step, i) => (
            <g key={i} transform={`translate(0, ${16 + i * 18})`}>
              <rect x={0} y={-9} width={12} height={12} rx={2} fill={COLORS.red} fillOpacity={0.2}
                stroke={COLORS.red} strokeWidth={0.8} />
              <text x={6} y={1} textAnchor="middle" fontSize="7" fontWeight="600" fill={COLORS.red}>{i + 1}</text>
              <text x={18} y={1} fontSize="8" fill={COLORS.dark}>{step}</text>
            </g>
          ))}
        </g>

        {/* ─── FlashAttention Panel ─── */}
        <text x={flashGridX + panelW / 2} y={118} textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.green}>
          {t.flash}
        </text>
        <text x={flashGridX + panelW / 2} y={134} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.scoreMatrix} [{t.nxn}] — {t.tileInSRAM}
        </text>

        {/* Flash grid: only active tile highlighted green */}
        <g transform={`translate(${flashGridX + 20}, ${gridY})`}>
          {Array.from({ length: GRID_CELLS }).map((_, r) =>
            Array.from({ length: GRID_CELLS }).map((_, c) => {
              const isActive = r === animTileRow && c === animTileCol;
              const isProcessed = r < animTileRow || (r === animTileRow && c < animTileCol);
              return (
                <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize}
                  width={cellSize - 1} height={cellSize - 1} rx={1}
                  fill={isActive ? COLORS.green : isProcessed ? COLORS.valid : COLORS.masked}
                  fillOpacity={isActive ? 0.7 : isProcessed ? 0.5 : 0.4}
                  stroke={isActive ? COLORS.green : COLORS.light}
                  strokeWidth={isActive ? 2 : 0.5} />
              );
            })
          )}
          {/* Active tile label */}
          <motion.rect
            x={animTileCol * cellSize - 1}
            y={animTileRow * cellSize - 1}
            width={cellSize + 1}
            height={cellSize + 1}
            rx={2}
            fill="none"
            stroke={COLORS.green}
            strokeWidth={2.5}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <text x={gridSize / 2} y={gridSize + 14} textAnchor="middle" fontSize="8" fill={COLORS.green}>
            SRAM tile: {tileSize}x{tileSize}
          </text>
          {/* Axis labels */}
          <text x={gridSize / 2} y={-6} textAnchor="middle" fontSize="7" fill={COLORS.mid}>K (N={N})</text>
          <text x={-10} y={gridSize / 2} textAnchor="middle" fontSize="7" fill={COLORS.mid}
            transform={`rotate(-90, -10, ${gridSize / 2})`}>Q (N={N})</text>
        </g>

        {/* Flash memory flow */}
        <g transform={`translate(${flashGridX + gridSize + 50}, ${gridY})`}>
          <text x={0} y={0} fontSize="9" fontWeight="600" fill={COLORS.dark}>{t.memFlow}:</text>
          {t.flashSteps.map((step, i) => (
            <g key={i} transform={`translate(0, ${16 + i * 18})`}>
              <rect x={0} y={-9} width={12} height={12} rx={2}
                fill={i <= 1 ? COLORS.green : i <= 3 ? COLORS.primary : COLORS.green}
                fillOpacity={0.2}
                stroke={i <= 1 ? COLORS.green : i <= 3 ? COLORS.primary : COLORS.green}
                strokeWidth={0.8} />
              <text x={6} y={1} textAnchor="middle" fontSize="7" fontWeight="600"
                fill={i <= 1 ? COLORS.green : i <= 3 ? COLORS.primary : COLORS.green}>
                {i + 1}
              </text>
              <text x={18} y={1} fontSize="8" fill={COLORS.dark}>{step}</text>
            </g>
          ))}
          <text x={0} y={16 + t.flashSteps.length * 18 + 4} fontSize="7.5" fill={COLORS.mid} fontStyle="italic">
            {locale === 'zh' ? '+ online softmax 在 SRAM 内完成' : '+ online softmax computed in SRAM'}
          </text>
        </g>

        {/* ─── Bottom Comparison ─── */}
        <g transform={`translate(30, ${H - 180})`}>
          <rect x={0} y={0} width={W - 60} height={170} rx={8} fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

          <text x={20} y={22} fontSize="11" fontWeight="700" fill={COLORS.dark}>{t.hbmAccess}</text>

          {/* Bar chart */}
          {(() => {
            const barLeft = 20;
            const maxBarW = 320;
            const maxVal = Math.max(stdHBM, flashHBM);
            const stdBarW = (stdHBM / maxVal) * maxBarW;
            const flashBarW = (flashHBM / maxVal) * maxBarW;
            return (
              <g transform="translate(0, 34)">
                <text x={barLeft} y={10} fontSize="9" fontWeight="600" fill={COLORS.red}>{t.standard}</text>
                <motion.rect x={barLeft + 100} y={0} height={16} rx={4} fill={COLORS.red} fillOpacity={0.6}
                  initial={{ width: 0 }} animate={{ width: stdBarW }} transition={{ duration: 0.6 }} />
                <text x={barLeft + 104 + stdBarW} y={12} fontSize="9" fontWeight="700" fill={COLORS.red}
                  style={{ fontFamily: FONTS.mono }}>
                  {stdHBM.toFixed(1)} MB
                </text>

                <text x={barLeft} y={38} fontSize="9" fontWeight="600" fill={COLORS.green}>{t.flash}</text>
                <motion.rect x={barLeft + 100} y={28} height={16} rx={4} fill={COLORS.green} fillOpacity={0.6}
                  initial={{ width: 0 }} animate={{ width: flashBarW }} transition={{ duration: 0.6 }} />
                <text x={barLeft + 104 + flashBarW} y={40} fontSize="9" fontWeight="700" fill={COLORS.green}
                  style={{ fontFamily: FONTS.mono }}>
                  {flashHBM.toFixed(1)} MB
                </text>
              </g>
            );
          })()}

          {/* I/O Complexity */}
          <g transform={`translate(${W - 360}, 34)`}>
            <text x={0} y={0} fontSize="10" fontWeight="700" fill={COLORS.dark}>{t.ioComplexity}</text>
            <text x={0} y={18} fontSize="9" fill={COLORS.red}>
              {t.standard}: <tspan fontWeight="700" style={{ fontFamily: FONTS.mono }}>{t.stdComplexity}</tspan>
            </text>
            <text x={0} y={34} fontSize="9" fill={COLORS.green}>
              {t.flash}: <tspan fontWeight="700" style={{ fontFamily: FONTS.mono }}>{t.flashComplexity}</tspan>
            </text>
            <text x={0} y={54} fontSize="8" fill={COLORS.mid}>
              M = SRAM = {sramKB} KB, d = {d}
            </text>
          </g>

          {/* Savings badge */}
          <g transform={`translate(${(W - 60) / 2 - 80}, 100)`}>
            <motion.rect x={0} y={0} width={220} height={50} rx={10}
              fill={COLORS.green} fillOpacity={0.1} stroke={COLORS.green} strokeWidth={2}
              animate={{ strokeOpacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <text x={110} y={22} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.dark}>
              {t.savings}
            </text>
            <text x={110} y={42} textAnchor="middle" fontSize="16" fontWeight="800" fill={COLORS.green}
              style={{ fontFamily: FONTS.mono }}>
              {savings.toFixed(0)}% ({(stdHBM / flashHBM).toFixed(1)}x)
            </text>
          </g>

          {/* Sequence length impact note */}
          <text x={(W - 60) / 2} y={162} textAnchor="middle" fontSize="7.5" fill={COLORS.mid}>
            {locale === 'zh'
              ? `N=${N}, d=${d}: 标准 S 矩阵 ${(N * N * 2 / 1024 / 1024).toFixed(1)} MB。序列越长，FlashAttention 优势越明显。`
              : `N=${N}, d=${d}: Standard S matrix ${(N * N * 2 / 1024 / 1024).toFixed(1)} MB. Longer sequences → larger FlashAttention advantage.`}
          </text>
        </g>
      </svg>
    </div>
  );
}
