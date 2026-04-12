import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

const PATCH_COLORS = ['#93c5fd', '#86efac', '#fde68a', '#fca5a5', '#c4b5fd', '#fbcfe8'];

export default function SpatiotemporalPatchDemo({ locale = 'zh' }: Props) {
  const [patchSizeT, setPatchSizeT] = useState<1 | 2 | 4>(2);

  const t = {
    zh: {
      title: '视频的时空 Patch 分割',
      frames: '帧',
      spatial: '空间维度',
      time: '时间维度',
      patchLabel: '时间 patch 大小 (p_t)',
      tokenNote: '这个 3D patch 变成一个 token',
      calcLabel: '总 token 数',
      params: '参数: H=256, W=256, T=8, p_h=p_w=32',
    },
    en: {
      title: 'Spatiotemporal Patch Decomposition',
      frames: 'frames',
      spatial: 'Spatial',
      time: 'Time',
      patchLabel: 'Temporal patch size (p_t)',
      tokenNote: 'This 3D patch becomes one token',
      calcLabel: 'Total tokens',
      params: 'Params: H=256, W=256, T=8, p_h=p_w=32',
    },
  }[locale]!;

  const videoH = 256, videoW = 256, totalT = 8;
  const pH = 32, pW = 32;
  const spatialPatchesH = videoH / pH;
  const spatialPatchesW = videoW / pW;
  const temporalPatches = totalT / patchSizeT;
  const totalTokens = spatialPatchesH * spatialPatchesW * temporalPatches;

  // Isometric projection helpers
  const isoX = (x: number, y: number, z: number) => 350 + (x - y) * 0.7;
  const isoY = (x: number, y: number, z: number) => 280 + (x + y) * 0.35 - z * 0.8;

  // Frame stack parameters
  const frameW = 160, frameH = 160;
  const frameSpacing = 30;

  const frames = useMemo(() => {
    let result: { idx: number; group: number }[] = [];
    for (let i = 0; i < totalT; i++) {
      result.push({ idx: i, group: Math.floor(i / patchSizeT) });
    }
    return result;
  }, [patchSizeT]);

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }}>
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Draw frames as stacked parallelograms (back to front) */}
        {frames.map((frame, fi) => {
          const zOff = (totalT - 1 - fi) * frameSpacing;
          const groupColor = PATCH_COLORS[frame.group % PATCH_COLORS.length];
          const baseX = isoX(0, 0, zOff);
          const baseY = isoY(0, 0, zOff);

          return (
            <motion.g
              key={fi}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: fi * 0.05 }}
            >
              {/* Frame background */}
              <polygon
                points={`${baseX},${baseY} ${baseX + frameW * 0.7},${baseY + frameW * 0.35} ${baseX + frameW * 0.7 - frameH * 0.7},${baseY + frameW * 0.35 + frameH * 0.35} ${baseX - frameH * 0.7},${baseY + frameH * 0.35}`}
                fill={groupColor}
                fillOpacity={0.3}
                stroke={groupColor}
                strokeWidth={1.5}
                strokeOpacity={0.6}
              />

              {/* Spatial grid overlay */}
              {Array.from({ length: spatialPatchesH }, (_, r) =>
                Array.from({ length: spatialPatchesW }, (_, c) => {
                  const cellW = frameW / spatialPatchesW;
                  const cellH = frameH / spatialPatchesH;
                  const cx = c * cellW;
                  const cy = r * cellH;
                  const x1 = isoX(cx, cy, zOff);
                  const y1 = isoY(cx, cy, zOff);
                  const x2 = isoX(cx + cellW, cy, zOff);
                  const y2 = isoY(cx + cellW, cy, zOff);
                  const x3 = isoX(cx + cellW, cy + cellH, zOff);
                  const y3 = isoY(cx + cellW, cy + cellH, zOff);
                  const x4 = isoX(cx, cy + cellH, zOff);
                  const y4 = isoY(cx, cy + cellH, zOff);

                  return (
                    <polygon
                      key={`${fi}-${r}-${c}`}
                      points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
                      fill="none"
                      stroke={groupColor}
                      strokeWidth={0.5}
                      strokeOpacity={0.4}
                    />
                  );
                })
              )}

              {/* Frame label */}
              <text
                x={baseX + frameW * 0.7 + 8}
                y={baseY + frameW * 0.35 - 4}
                fontSize="9" fill={COLORS.mid}
              >
                F{fi}
              </text>
            </motion.g>
          );
        })}

        {/* Highlight one patch group */}
        <motion.g
          key={`highlight-${patchSizeT}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Annotation arrow and label */}
          <line x1={580} y1={120} x2={500} y2={180}
            stroke={COLORS.primary} strokeWidth={1.5} strokeDasharray="4 2" />
          <rect x={560} y={95} width={200} height={36} rx={6}
            fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
          <text x={660} y={110} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.primary}>
            {t.tokenNote}
          </text>
          <text x={660} y={124} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
            {pH}×{pW}×{patchSizeT} → 1 token
          </text>
        </motion.g>

        {/* Axis labels */}
        <text x={140} y={H - 120} fontSize="10" fontWeight="600" fill={COLORS.mid}>
          ← {t.spatial} (H×W) →
        </text>
        <text x={60} y={160} fontSize="10" fontWeight="600" fill={COLORS.mid}
          transform="rotate(-55, 60, 160)">
          ← {t.time} (T={totalT}) →
        </text>

        {/* Temporal patch group brackets */}
        {Array.from({ length: temporalPatches }, (_, gi) => {
          const startFrame = gi * patchSizeT;
          const endFrame = startFrame + patchSizeT - 1;
          const zStart = (totalT - 1 - startFrame) * frameSpacing;
          const zEnd = (totalT - 1 - endFrame) * frameSpacing;
          const color = PATCH_COLORS[gi % PATCH_COLORS.length];
          const labelX = isoX(0, 0, zStart) - 55;
          const labelYStart = isoY(0, 0, zStart) + 10;
          const labelYEnd = isoY(0, 0, zEnd) + 10;
          const labelYMid = (labelYStart + labelYEnd) / 2;

          return (
            <motion.g
              key={`bracket-${gi}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + gi * 0.05 }}
            >
              <line x1={labelX + 20} y1={labelYStart} x2={labelX + 20} y2={labelYEnd}
                stroke={color} strokeWidth={2} />
              <line x1={labelX + 15} y1={labelYStart} x2={labelX + 25} y2={labelYStart}
                stroke={color} strokeWidth={2} />
              <line x1={labelX + 15} y1={labelYEnd} x2={labelX + 25} y2={labelYEnd}
                stroke={color} strokeWidth={2} />
              <text x={labelX + 10} y={labelYMid + 3} textAnchor="middle"
                fontSize="8" fontWeight="600" fill={color}>
                p_t={patchSizeT}
              </text>
            </motion.g>
          );
        })}

        {/* Controls */}
        <rect x={30} y={H - 90} width={W - 60} height={80} rx={8}
          fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />

        <text x={50} y={H - 65} fontSize="11" fontWeight="600" fill={COLORS.dark}>
          {t.patchLabel}:
        </text>
        {([1, 2, 4] as const).map((val, i) => (
          <g key={val} onClick={() => setPatchSizeT(val)} style={{ cursor: 'pointer' }}>
            <rect x={220 + i * 70} y={H - 78} width={50} height={26} rx={4}
              fill={patchSizeT === val ? COLORS.primary : COLORS.bg}
              stroke={patchSizeT === val ? COLORS.primary : COLORS.light}
              strokeWidth={1.5} />
            <text x={245 + i * 70} y={H - 61} textAnchor="middle"
              fontSize="12" fontWeight="600"
              fill={patchSizeT === val ? COLORS.bg : COLORS.dark}>
              {val}
            </text>
          </g>
        ))}

        {/* Token count calculation */}
        <text x={50} y={H - 35} fontSize="10" fill={COLORS.mid}>
          {t.params}
        </text>
        <text x={50} y={H - 20} fontSize="11" fontWeight="600" fill={COLORS.primary}>
          {t.calcLabel}: H/p_h × W/p_w × T/p_t = {spatialPatchesH}×{spatialPatchesW}×{temporalPatches} = {totalTokens} tokens
        </text>
      </svg>
    </div>
  );
}
