import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS, HEAD_COLORS } from './shared/colors';

/* ─── Types ─── */

interface Props {
  locale?: 'zh' | 'en';
}

type TransformType = 'original' | 'tiling' | 'permutation' | 'skewing';

interface Transform {
  type: TransformType;
  label: { zh: string; en: string };
  matrix: [number, number, number, number]; // [a, b, c, d] for [[a,b],[c,d]]
  tileSizes?: [number, number];
  description: { zh: string; en: string };
}

interface Point {
  i: number;
  j: number;
  displayX: number;
  displayY: number;
  executionOrder: number;
  tileId?: number;
}

/* ─── Data ─── */

const SPACE_SIZE = 8;

const TRANSFORMS: Transform[] = [
  {
    type: 'original',
    label: { zh: '原始顺序 (i, j)', en: 'Original Order (i, j)' },
    matrix: [1, 0, 0, 1],
    description: { zh: '按行优先顺序执行', en: 'Row-major execution' },
  },
  {
    type: 'permutation',
    label: { zh: '循环交换 (j, i)', en: 'Loop Interchange (j, i)' },
    matrix: [0, 1, 1, 0],
    description: { zh: '交换内外循环', en: 'Swap inner/outer loop' },
  },
  {
    type: 'tiling',
    label: { zh: 'Tiling (4×4)', en: 'Tiling (4×4)' },
    matrix: [1, 0, 0, 1],
    tileSizes: [4, 4],
    description: { zh: '切分为4个4×4 tile', en: 'Partition into 4 tiles of 4×4' },
  },
  {
    type: 'skewing',
    label: { zh: 'Skewing (i, i+j)', en: 'Skewing (i, i+j)' },
    matrix: [1, 0, 1, 1],
    description: { zh: '将原始空间的反对角线映射为新空间的水平行，实现wavefront parallelism', en: 'Maps anti-diagonals to horizontal rows for wavefront parallelism' },
  },
];

/* ─── SVG Constants ─── */

const W = 800;
const H = 550;
const GRID_LEFT = 50;
const GRID_TOP = 120;
const CELL_SIZE = 40;
const POINT_RADIUS = 8;
const CODE_PANEL_X = 520;
const CODE_PANEL_Y = 150;
const CODE_PANEL_W = 250;

/* ─── Utility Functions ─── */

function applyTransform(i: number, j: number, matrix: [number, number, number, number]): [number, number] {
  const [a, b, c, d] = matrix;
  return [a * i + b * j, c * i + d * j];
}

function computeExecutionOrder(points: Array<{ i: number; j: number }>, transform: Transform): number[] {
  const size = points.length;
  const orders = new Array(size);

  if (transform.type === 'tiling' && transform.tileSizes) {
    const [tileH, tileW] = transform.tileSizes;
    const tilesI = Math.ceil(SPACE_SIZE / tileH);
    const tilesJ = Math.ceil(SPACE_SIZE / tileW);
    let order = 0;
    for (let ti = 0; ti < tilesI; ti++) {
      for (let tj = 0; tj < tilesJ; tj++) {
        for (let i = ti * tileH; i < Math.min((ti + 1) * tileH, SPACE_SIZE); i++) {
          for (let j = tj * tileW; j < Math.min((tj + 1) * tileW, SPACE_SIZE); j++) {
            const idx = i * SPACE_SIZE + j;
            orders[idx] = order++;
          }
        }
      }
    }
  } else {
    const transformed = points.map((p, idx) => ({
      idx,
      t: applyTransform(p.i, p.j, transform.matrix),
    }));
    transformed.sort((a, b) => {
      if (a.t[0] !== b.t[0]) return a.t[0] - b.t[0];
      return a.t[1] - b.t[1];
    });
    transformed.forEach((item, order) => {
      orders[item.idx] = order;
    });
  }
  return orders;
}

function getTileId(i: number, j: number, tileSizes: [number, number]): number {
  const [tileH, tileW] = tileSizes;
  const ti = Math.floor(i / tileH);
  const tj = Math.floor(j / tileW);
  const tilesJ = Math.ceil(SPACE_SIZE / tileW);
  return ti * tilesJ + tj;
}

/* ─── Component ─── */

export default function PolyhedralVisualizer({ locale = 'zh' }: Props) {
  const [currentTransform, setCurrentTransform] = useState<TransformType>('original');
  const [animating, setAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState(100); // ms per frame

  const t = {
    zh: {
      title: 'Polyhedral 迭代空间可视化',
      subtitle: '8×8 迭代空间中的循环变换',
      speedLabel: '执行速度',
      play: '播放',
      pause: '暂停',
      reset: '重置',
      codeLabel: '循环代码',
      transformLabel: '变换类型',
    },
    en: {
      title: 'Polyhedral Iteration Space Visualization',
      subtitle: 'Loop transformations in 8×8 iteration space',
      speedLabel: 'Execution Speed',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      codeLabel: 'Loop Code',
      transformLabel: 'Transformation',
    },
  }[locale]!;

  const transform = useMemo(() => TRANSFORMS.find(t => t.type === currentTransform)!, [currentTransform]);

  const points: Point[] = useMemo(() => {
    const rawPoints = [];
    for (let i = 0; i < SPACE_SIZE; i++) {
      for (let j = 0; j < SPACE_SIZE; j++) {
        rawPoints.push({ i, j });
      }
    }
    const orders = computeExecutionOrder(rawPoints, transform);

    return rawPoints.map((p, idx) => {
      let displayX = GRID_LEFT + p.j * CELL_SIZE;
      let displayY = GRID_TOP + p.i * CELL_SIZE;

      if (transform.type === 'skewing') {
        const [ti, tj] = applyTransform(p.i, p.j, transform.matrix);
        displayX = GRID_LEFT + tj * CELL_SIZE;
        displayY = GRID_TOP + ti * CELL_SIZE;
      }

      return {
        ...p,
        displayX,
        displayY,
        executionOrder: orders[idx],
        tileId: transform.tileSizes ? getTileId(p.i, p.j, transform.tileSizes) : undefined,
      };
    });
  }, [transform]);

  // Animation effect
  useEffect(() => {
    if (!animating) return;
    const timer = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= SPACE_SIZE * SPACE_SIZE - 1) {
          setAnimating(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [animating, speed]);

  const handlePlay = () => {
    if (currentFrame >= SPACE_SIZE * SPACE_SIZE - 1) {
      setCurrentFrame(0);
    }
    setAnimating(true);
  };

  const handlePause = () => setAnimating(false);
  const handleReset = () => {
    setAnimating(false);
    setCurrentFrame(0);
  };

  // Generate loop code
  const loopCode = useMemo(() => {
    switch (transform.type) {
      case 'original':
        return 'for (int i = 0; i < N; i++)\n  for (int j = 0; j < N; j++)\n    C[i][j] = A[i][j] + B[i][j];';
      case 'permutation':
        return 'for (int j = 0; j < N; j++)\n  for (int i = 0; i < N; i++)\n    C[i][j] = A[i][j] + B[i][j];';
      case 'tiling':
        return 'for (int ii = 0; ii < N; ii += 4)\n  for (int jj = 0; jj < N; jj += 4)\n    for (int i = ii; i < ii+4; i++)\n      for (int j = jj; j < jj+4; j++)\n        C[i][j] = A[i][j] + B[i][j];';
      case 'skewing':
        return 'for (int ip = 0; ip < 2*N-1; ip++)\n  for (int jp = 0; jp < N; jp++) {\n    int i = ip - jp;\n    if (i >= 0 && i < N)\n      C[i][jp] = A[i][jp] + B[i][jp];\n  }';
    }
  }, [transform.type]);

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.subtitle}
        </text>

        {/* Transform buttons */}
        <g transform="translate(50, 60)">
          {TRANSFORMS.map((tr, idx) => {
            const active = tr.type === currentTransform;
            return (
              <g key={tr.type} transform={`translate(${idx * 110}, 0)`}>
                <rect
                  x={0}
                  y={0}
                  width={100}
                  height={28}
                  rx={4}
                  fill={active ? COLORS.primary : COLORS.bgAlt}
                  stroke={active ? COLORS.primary : COLORS.light}
                  strokeWidth={1.5}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setCurrentTransform(tr.type);
                    handleReset();
                  }}
                />
                <text
                  x={50}
                  y={15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={active ? COLORS.bg : COLORS.dark}
                  style={{ pointerEvents: 'none' }}
                >
                  {tr.label[locale]}
                </text>
              </g>
            );
          })}
        </g>

        {/* Grid and points */}
        <g>
          {/* Tile boundaries (for tiling) */}
          {transform.type === 'tiling' && transform.tileSizes && (
            <g>
              {[4].map(v => (
                <g key={v}>
                  <line
                    x1={GRID_LEFT}
                    y1={GRID_TOP + v * CELL_SIZE}
                    x2={GRID_LEFT + SPACE_SIZE * CELL_SIZE}
                    y2={GRID_TOP + v * CELL_SIZE}
                    stroke={COLORS.mid}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={GRID_LEFT + v * CELL_SIZE}
                    y1={GRID_TOP}
                    x2={GRID_LEFT + v * CELL_SIZE}
                    y2={GRID_TOP + SPACE_SIZE * CELL_SIZE}
                    stroke={COLORS.mid}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </g>
              ))}
            </g>
          )}

          {/* Axes */}
          <line
            x1={GRID_LEFT - 10}
            y1={GRID_TOP + SPACE_SIZE * CELL_SIZE + 10}
            x2={GRID_LEFT + SPACE_SIZE * CELL_SIZE + 10}
            y2={GRID_TOP + SPACE_SIZE * CELL_SIZE + 10}
            stroke={COLORS.mid}
            strokeWidth={1.5}
            markerEnd="url(#arrow-axis)"
          />
          <line
            x1={GRID_LEFT - 10}
            y1={GRID_TOP + SPACE_SIZE * CELL_SIZE + 10}
            x2={GRID_LEFT - 10}
            y2={GRID_TOP - 10}
            stroke={COLORS.mid}
            strokeWidth={1.5}
            markerEnd="url(#arrow-axis)"
          />
          <defs>
            <marker id="arrow-axis" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
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
          {points.map((p, idx) => {
            const executed = p.executionOrder <= currentFrame;
            const current = p.executionOrder === currentFrame;
            const tileColor = p.tileId !== undefined ? HEAD_COLORS[p.tileId % HEAD_COLORS.length] : COLORS.light;

            return (
              <motion.g
                key={`${p.i}-${p.j}`}
                initial={{ x: GRID_LEFT + p.j * CELL_SIZE, y: GRID_TOP + p.i * CELL_SIZE }}
                animate={{ x: p.displayX, y: p.displayY }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={POINT_RADIUS}
                  fill={
                    current
                      ? COLORS.orange
                      : executed
                        ? COLORS.primary
                        : transform.type === 'tiling'
                          ? tileColor
                          : COLORS.light
                  }
                  fillOpacity={transform.type === 'tiling' && !executed ? 0.3 : 1}
                  stroke={current ? COLORS.orange : executed ? COLORS.primary : COLORS.mid}
                  strokeWidth={current ? 2.5 : 1}
                  strokeOpacity={0.6}
                />
                {current && (
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={POINT_RADIUS + 4}
                    fill="none"
                    stroke={COLORS.orange}
                    strokeWidth={2}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.3, 1.3] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </motion.g>
            );
          })}
        </g>

        {/* Code panel */}
        <g>
          <rect
            x={CODE_PANEL_X}
            y={CODE_PANEL_Y}
            width={CODE_PANEL_W}
            height={160}
            rx={6}
            fill="#1e1e2e"
            stroke={COLORS.primary}
            strokeWidth={1.5}
            strokeOpacity={0.4}
          />
          <rect
            x={CODE_PANEL_X}
            y={CODE_PANEL_Y}
            width={CODE_PANEL_W}
            height={24}
            rx={6}
            fill={COLORS.primary}
            fillOpacity={0.15}
          />
          <rect
            x={CODE_PANEL_X}
            y={CODE_PANEL_Y + 10}
            width={CODE_PANEL_W}
            height={14}
            fill={COLORS.primary}
            fillOpacity={0.15}
          />
          <text
            x={CODE_PANEL_X + CODE_PANEL_W / 2}
            y={CODE_PANEL_Y + 14}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={COLORS.primary}
          >
            {t.codeLabel}
          </text>
          {loopCode.split('\n').map((line, idx) => (
            <text
              key={idx}
              x={CODE_PANEL_X + 12}
              y={CODE_PANEL_Y + 42 + idx * 16}
              fontSize="9.5"
              fill="#ccc"
              style={{ fontFamily: FONTS.mono }}
            >
              {line}
            </text>
          ))}
        </g>

        {/* Description panel */}
        <g>
          <rect
            x={CODE_PANEL_X}
            y={CODE_PANEL_Y + 170}
            width={CODE_PANEL_W}
            height={60}
            rx={6}
            fill={COLORS.bgAlt}
            stroke={COLORS.light}
            strokeWidth={1}
          />
          <text
            x={CODE_PANEL_X + 10}
            y={CODE_PANEL_Y + 186}
            fontSize="10"
            fontWeight="600"
            fill={COLORS.dark}
          >
            {t.transformLabel}
          </text>
          <text
            x={CODE_PANEL_X + 10}
            y={CODE_PANEL_Y + 204}
            fontSize="9"
            fill={COLORS.mid}
          >
            {transform.description[locale].length > 50
              ? transform.description[locale].substring(0, 48) + '...'
              : transform.description[locale]}
          </text>
          <text
            x={CODE_PANEL_X + 10}
            y={CODE_PANEL_Y + 218}
            fontSize="9"
            fill={COLORS.mid}
          >
            {transform.description[locale].length > 50 ? transform.description[locale].substring(48) : ''}
          </text>
        </g>

        {/* Controls */}
        <g transform={`translate(${CODE_PANEL_X}, 440)`}>
          <text x={0} y={0} fontSize="10" fontWeight="600" fill={COLORS.dark}>
            {t.speedLabel}
          </text>
          <rect x={0} y={8} width={CODE_PANEL_W} height={4} rx={2} fill={COLORS.light} />
          <rect
            x={0}
            y={8}
            width={(CODE_PANEL_W * (200 - speed)) / 180}
            height={4}
            rx={2}
            fill={COLORS.primary}
          />
          <circle
            cx={(CODE_PANEL_W * (200 - speed)) / 180}
            cy={10}
            r={8}
            fill={COLORS.primary}
            stroke={COLORS.bg}
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
            onMouseDown={(e) => {
              const svg = e.currentTarget.ownerSVGElement!;
              const rect = svg.getBoundingClientRect();
              const moveHandler = (me: MouseEvent) => {
                const x = ((me.clientX - rect.left) / rect.width) * W - CODE_PANEL_X;
                const ratio = Math.max(0, Math.min(1, x / CODE_PANEL_W));
                setSpeed(200 - ratio * 180);
              };
              const upHandler = () => {
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
              };
              document.addEventListener('mousemove', moveHandler);
              document.addEventListener('mouseup', upHandler);
            }}
          />

          {/* Buttons */}
          <g transform="translate(0, 30)">
            {[
              { label: t.play, action: handlePlay, disabled: animating },
              { label: t.pause, action: handlePause, disabled: !animating },
              { label: t.reset, action: handleReset, disabled: false },
            ].map((btn, idx) => (
              <g key={idx} transform={`translate(${idx * 85}, 0)`}>
                <rect
                  x={0}
                  y={0}
                  width={75}
                  height={26}
                  rx={4}
                  fill={btn.disabled ? COLORS.light : COLORS.primary}
                  fillOpacity={btn.disabled ? 0.3 : 1}
                  style={{ cursor: btn.disabled ? 'not-allowed' : 'pointer' }}
                  onClick={btn.disabled ? undefined : btn.action}
                />
                <text
                  x={37.5}
                  y={13}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={btn.disabled ? COLORS.mid : COLORS.bg}
                  style={{ pointerEvents: 'none' }}
                >
                  {btn.label}
                </text>
              </g>
            ))}
          </g>
        </g>

        {/* Progress indicator */}
        <g transform="translate(50, 470)">
          <text x={0} y={0} fontSize="10" fill={COLORS.mid}>
            Execution: {currentFrame + 1} / {SPACE_SIZE * SPACE_SIZE}
          </text>
          <rect x={0} y={6} width={400} height={6} rx={3} fill={COLORS.light} />
          <rect
            x={0}
            y={6}
            width={(400 * (currentFrame + 1)) / (SPACE_SIZE * SPACE_SIZE)}
            height={6}
            rx={3}
            fill={COLORS.primary}
          />
        </g>
      </svg>
    </div>
  );
}
