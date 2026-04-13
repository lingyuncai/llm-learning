import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

type TilingLevel = 'naive' | 'thread_block' | 'warp' | 'register';

interface TileConfig {
  level: TilingLevel;
  M: number;
  N: number;
  K: number;
  description: { zh: string; en: string };
  memoryLevel: string;
  color: string;
  bandwidth: { label: string; value: number; unit: string };
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const TILING_LEVELS: TileConfig[] = [
  {
    level: 'naive',
    M: 4096, N: 4096, K: 4096,
    description: {
      zh: 'Naive：整个矩阵在 HBM 中计算，无 tiling。每个元素都需要从全局显存读写，数据复用率极低。',
      en: 'Naive: entire matrix computed in HBM, no tiling. Every element requires global memory read/write, extremely low data reuse.',
    },
    memoryLevel: 'HBM',
    color: COLORS.red,
    bandwidth: { label: 'HBM', value: 2, unit: 'TB/s' },
  },
  {
    level: 'thread_block',
    M: 128, N: 128, K: 32,
    description: {
      zh: 'Thread Block Tile：每个线程块负责 128×128 输出块，沿 K 维以 32 步进。数据从 HBM 加载到 Shared Memory 暂存，复用率大幅提升。',
      en: 'Thread Block Tile: each thread block handles a 128×128 output block, stepping by 32 along K. Data staged from HBM to Shared Memory, dramatically improving reuse.',
    },
    memoryLevel: 'Shared Memory',
    color: COLORS.orange,
    bandwidth: { label: 'SMEM', value: 19, unit: 'TB/s' },
  },
  {
    level: 'warp',
    M: 64, N: 64, K: 32,
    description: {
      zh: 'Warp Tile：每个 warp 负责 64×64 子块，从 Shared Memory 读取数据到 Register File。CUTLASS 中每个 warp 执行独立的矩阵乘法片段。',
      en: 'Warp Tile: each warp handles a 64×64 sub-block, reading from Shared Memory into Register File. In CUTLASS, each warp executes independent matmul fragments.',
    },
    memoryLevel: 'Shared Memory → Register',
    color: COLORS.primary,
    bandwidth: { label: 'SMEM→Reg', value: 19, unit: 'TB/s' },
  },
  {
    level: 'register',
    M: 16, N: 16, K: 16,
    description: {
      zh: 'Register Tile：16×16×16 MMA 指令（Tensor Core）。数据完全在 Register File 中，由 Tensor Core 直接计算，达到峰值吞吐。',
      en: 'Register Tile: 16×16×16 MMA instruction (Tensor Core). Data fully in Register File, computed directly by Tensor Core at peak throughput.',
    },
    memoryLevel: 'Register File',
    color: COLORS.green,
    bandwidth: { label: 'Register', value: 100, unit: '(on-chip)' },
  },
];

const BANDWIDTH_MAX = 100;

/* ─── Component ─── */

export default function TilingHierarchyExplorer({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: '多级 Tiling 层次浏览器',
      tileDim: 'Tile 尺寸',
      memLevel: '内存层级',
      bwLabel: '带宽',
      nesting: 'Tiling 嵌套关系',
      nestArrow: 'Thread Block → Warp → MMA',
      nestSizes: '128×128    64×64    16×16',
    },
    en: {
      title: 'Multi-Level Tiling Hierarchy Explorer',
      tileDim: 'Tile Size',
      memLevel: 'Memory Level',
      bwLabel: 'Bandwidth',
      nesting: 'Tiling Nesting',
      nestArrow: 'Thread Block → Warp → MMA',
      nestSizes: '128×128    64×64    16×16',
    },
  }[locale]!;

  const [activeLevel, setActiveLevel] = useState<TilingLevel>('naive');
  const config = TILING_LEVELS.find(l => l.level === activeLevel)!;

  /* ── Matrix grid rendering ── */
  function renderMatrixView() {
    const ox = 20, oy = 80, size = 340;

    if (activeLevel === 'naive') {
      return (
        <motion.rect
          key="naive"
          x={ox} y={oy} width={size} height={size} rx="4"
          fill={COLORS.red} fillOpacity={0.15}
          stroke={COLORS.red} strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      );
    }

    if (activeLevel === 'thread_block') {
      const gridN = 8;
      const cellSize = size / gridN;
      const rects = [];
      for (let r = 0; r < gridN; r++) {
        for (let c = 0; c < gridN; c++) {
          const isHighlighted = r === 1 && c === 2;
          rects.push(
            <motion.rect
              key={`tb-${r}-${c}`}
              x={ox + c * cellSize + 1} y={oy + r * cellSize + 1}
              width={cellSize - 2} height={cellSize - 2} rx="2"
              fill={COLORS.orange}
              fillOpacity={isHighlighted ? 0.6 : 0.12}
              stroke={COLORS.orange}
              strokeWidth={isHighlighted ? 2 : 0.5}
              strokeOpacity={isHighlighted ? 1 : 0.4}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: (r * gridN + c) * 0.01 }}
            />
          );
        }
      }
      return <>{rects}</>;
    }

    if (activeLevel === 'warp') {
      const gridN = 2;
      const cellSize = size / gridN;
      const rects = [];
      // Parent block outline
      rects.push(
        <rect key="warp-parent" x={ox} y={oy} width={size} height={size} rx="4"
          fill="none" stroke={COLORS.orange} strokeWidth="2" strokeDasharray="6,3" strokeOpacity={0.5} />
      );
      for (let r = 0; r < gridN; r++) {
        for (let c = 0; c < gridN; c++) {
          const isHighlighted = r === 0 && c === 0;
          rects.push(
            <motion.rect
              key={`warp-${r}-${c}`}
              x={ox + c * cellSize + 3} y={oy + r * cellSize + 3}
              width={cellSize - 6} height={cellSize - 6} rx="3"
              fill={COLORS.primary}
              fillOpacity={isHighlighted ? 0.5 : 0.12}
              stroke={COLORS.primary}
              strokeWidth={isHighlighted ? 2 : 1}
              strokeOpacity={isHighlighted ? 1 : 0.4}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: (r * gridN + c) * 0.08 }}
            />
          );
        }
      }
      // Labels on each warp tile
      rects.push(
        <text key="warp-label-0" x={ox + cellSize / 2} y={oy + cellSize / 2} textAnchor="middle" dominantBaseline="middle"
          fontSize="13" fontFamily={FONTS.mono} fill={COLORS.primary} fontWeight="600">Warp 0</text>,
        <text key="warp-label-1" x={ox + cellSize * 1.5} y={oy + cellSize / 2} textAnchor="middle" dominantBaseline="middle"
          fontSize="13" fontFamily={FONTS.mono} fill={COLORS.primary} fillOpacity={0.5}>Warp 1</text>,
        <text key="warp-label-2" x={ox + cellSize / 2} y={oy + cellSize * 1.5} textAnchor="middle" dominantBaseline="middle"
          fontSize="13" fontFamily={FONTS.mono} fill={COLORS.primary} fillOpacity={0.5}>Warp 2</text>,
        <text key="warp-label-3" x={ox + cellSize * 1.5} y={oy + cellSize * 1.5} textAnchor="middle" dominantBaseline="middle"
          fontSize="13" fontFamily={FONTS.mono} fill={COLORS.primary} fillOpacity={0.5}>Warp 3</text>
      );
      return <>{rects}</>;
    }

    // register level
    const gridN = 4;
    const cellSize = size / gridN;
    const rects = [];
    // Parent warp outline
    rects.push(
      <rect key="reg-parent" x={ox} y={oy} width={size} height={size} rx="4"
        fill="none" stroke={COLORS.primary} strokeWidth="2" strokeDasharray="6,3" strokeOpacity={0.5} />
    );
    for (let r = 0; r < gridN; r++) {
      for (let c = 0; c < gridN; c++) {
        const isHighlighted = r === 0 && c === 0;
        rects.push(
          <motion.rect
            key={`reg-${r}-${c}`}
            x={ox + c * cellSize + 2} y={oy + r * cellSize + 2}
            width={cellSize - 4} height={cellSize - 4} rx="2"
            fill={COLORS.green}
            fillOpacity={isHighlighted ? 0.5 : 0.12}
            stroke={COLORS.green}
            strokeWidth={isHighlighted ? 2 : 0.5}
            strokeOpacity={isHighlighted ? 1 : 0.3}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: (r * gridN + c) * 0.03 }}
          />
        );
      }
    }
    // MMA label in highlighted tile
    rects.push(
      <text key="mma-label" x={ox + cellSize / 2} y={oy + cellSize / 2} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontFamily={FONTS.mono} fill={COLORS.green} fontWeight="700">MMA</text>
    );
    return <>{rects}</>;
  }

  /* ── Bandwidth bar ── */
  function renderBandwidthBar() {
    const bx = 425, by = 310, bw = 340, bh = 18;
    const ratio = Math.min(config.bandwidth.value / BANDWIDTH_MAX, 1);
    return (
      <>
        <text x={bx} y={by - 8} fontSize="11" fontFamily={FONTS.sans} fill={COLORS.mid} fontWeight="600">{t.bwLabel}</text>
        <rect x={bx} y={by} width={bw} height={bh} rx="4" fill={COLORS.light} />
        <motion.rect
          x={bx} y={by} height={bh} rx="4"
          fill={config.color} fillOpacity={0.7}
          initial={{ width: 0 }}
          animate={{ width: bw * ratio }}
          transition={{ duration: 0.5 }}
        />
        <text x={bx + bw + 8} y={by + 13} fontSize="10" fontFamily={FONTS.mono} fill={config.color} fontWeight="600">
          {config.bandwidth.value === 100 ? '∞' : `${config.bandwidth.value} ${config.bandwidth.unit}`}
        </text>
      </>
    );
  }

  return (
    <div className="my-6">
      <svg viewBox="0 0 800 520" className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x="400" y="24" textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Level selector buttons */}
        {TILING_LEVELS.map((level, i) => {
          const bx = 80 + i * 170;
          const isActive = activeLevel === level.level;
          return (
            <g key={level.level} onClick={() => setActiveLevel(level.level)} style={{ cursor: 'pointer' }}>
              <rect x={bx} y={38} width={150} height={28} rx="6"
                fill={isActive ? level.color : COLORS.bgAlt}
                fillOpacity={isActive ? 0.15 : 1}
                stroke={isActive ? level.color : COLORS.light}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={bx + 75} y={56} textAnchor="middle" fontSize="11" fontWeight={isActive ? '700' : '500'}
                fill={isActive ? level.color : COLORS.mid} fontFamily={FONTS.mono}>
                {level.level === 'naive' ? 'Naive' :
                 level.level === 'thread_block' ? 'Thread Block' :
                 level.level === 'warp' ? 'Warp' : 'Register/MMA'}
              </text>
            </g>
          );
        })}

        {/* Left panel: Matrix view */}
        <AnimatePresence mode="wait">
          <motion.g
            key={activeLevel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderMatrixView()}
          </motion.g>
        </AnimatePresence>

        {/* Matrix label */}
        <text x="190" y="438" textAnchor="middle" fontSize="11" fill={COLORS.mid}>
          {activeLevel === 'naive' ? 'C[4096×4096]' :
           activeLevel === 'thread_block' ? `${Math.ceil(4096 / 128)}×${Math.ceil(4096 / 128)} = 32×32 blocks` :
           activeLevel === 'warp' ? `1 Block → 2×2 Warps` :
           '1 Warp → 4×4 MMA tiles'}
        </text>

        {/* Right panel: Info card */}
        <rect x="400" y="80" width="380" height="200" rx="8"
          fill={config.color} fillOpacity={0.04}
          stroke={config.color} strokeWidth="1.5" strokeOpacity={0.3}
        />

        {/* Tile dimensions */}
        <text x={425} y={110} fontSize="12" fontWeight="600" fill={COLORS.dark}>{t.tileDim}</text>
        <text x={425} y={132} fontSize="20" fontWeight="700" fontFamily={FONTS.mono} fill={config.color}>
          {`${config.M}×${config.N}×${config.K}`}
        </text>
        <text x={425} y={148} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
          M × N × K
        </text>

        {/* Memory level */}
        <text x={425} y={178} fontSize="12" fontWeight="600" fill={COLORS.dark}>{t.memLevel}</text>
        <rect x={425} y={185} width={config.memoryLevel.length * 9 + 16} height={22} rx="4"
          fill={config.color} fillOpacity={0.1}
        />
        <text x={433} y={200} fontSize="11" fontWeight="600" fontFamily={FONTS.mono} fill={config.color}>
          {config.memoryLevel}
        </text>

        {/* Description */}
        {config.description[locale].split('。').filter(Boolean).map((sentence, i) => (
          <text key={i} x={425} y={232 + i * 16} fontSize="10.5" fill={COLORS.mid}>
            {sentence}{sentence.endsWith('.') ? '' : locale === 'zh' ? '。' : '.'}
          </text>
        ))}

        {/* Bandwidth bar */}
        {renderBandwidthBar()}

        {/* Bottom: Nesting diagram */}
        <text x="400" y="470" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark}>
          {t.nesting}
        </text>

        {/* Nesting arrows */}
        {[
          { x: 130, w: 140, label: 'Thread Block', sub: '128×128', color: COLORS.orange },
          { x: 330, w: 100, label: 'Warp', sub: '64×64', color: COLORS.primary },
          { x: 490, w: 100, label: 'MMA', sub: '16×16×16', color: COLORS.green },
        ].map((item, i) => (
          <g key={item.label}>
            <rect x={item.x} y={483} width={item.w} height={28} rx="6"
              fill={item.color} fillOpacity={0.1}
              stroke={item.color} strokeWidth="1.5"
            />
            <text x={item.x + item.w / 2} y={495} textAnchor="middle" fontSize="10" fontWeight="600"
              fill={item.color} fontFamily={FONTS.mono}>
              {item.label}
            </text>
            <text x={item.x + item.w / 2} y={507} textAnchor="middle" fontSize="9"
              fill={item.color} fillOpacity={0.7} fontFamily={FONTS.mono}>
              {item.sub}
            </text>
            {i < 2 && (
              <>
                <line x1={item.x + item.w + 4} y1={497} x2={item.x + item.w + 50} y2={497}
                  stroke={COLORS.mid} strokeWidth="1.5" strokeOpacity={0.4} />
                <polygon
                  points={`${item.x + item.w + 46},493 ${item.x + item.w + 54},497 ${item.x + item.w + 46},501`}
                  fill={COLORS.mid} fillOpacity={0.4}
                />
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
