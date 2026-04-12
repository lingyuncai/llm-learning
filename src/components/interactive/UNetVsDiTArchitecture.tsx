import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

type HighlightZone = 'input' | 'backbone' | 'output' | null;

export default function UNetVsDiTArchitecture({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'U-Net vs DiT：架构对比',
      unet: 'U-Net (传统扩散)',
      dit: 'DiT (Transformer 扩散)',
      unetDesc: 'CNN-based · 固定分辨率 · 有限 scaling',
      ditDesc: 'Transformer-based · 灵活 · 随计算量 scaling',
      input: '噪声潜变量 z_t',
      output: '预测噪声 ε',
      encoder: 'Encoder',
      decoder: 'Decoder',
      skip: 'Skip Connection',
      bottleneck: 'Bottleneck',
      patchify: 'Patchify',
      unpatchify: 'Unpatchify',
      transformerBlock: 'Transformer Block',
      nBlocks: '× N 层',
      condInput: '条件输入 (t, c)',
      comparison: [
        ['特性', 'U-Net', 'DiT'],
        ['骨干网络', 'CNN (卷积)', 'Transformer (注意力)'],
        ['分辨率', '固定 (架构绑定)', '灵活 (patch 大小可调)'],
        ['Scaling', '受限 (架构瓶颈)', '持续提升 (更多层/头)'],
        ['条件注入', 'Cross-Attention', 'adaLN-Zero'],
      ],
    },
    en: {
      title: 'U-Net vs DiT: Architecture Comparison',
      unet: 'U-Net (Traditional Diffusion)',
      dit: 'DiT (Transformer Diffusion)',
      unetDesc: 'CNN-based · Fixed resolution · Limited scaling',
      ditDesc: 'Transformer-based · Flexible · Scales with compute',
      input: 'Noisy latent z_t',
      output: 'Predicted noise ε',
      encoder: 'Encoder',
      decoder: 'Decoder',
      skip: 'Skip Connection',
      bottleneck: 'Bottleneck',
      patchify: 'Patchify',
      unpatchify: 'Unpatchify',
      transformerBlock: 'Transformer Block',
      nBlocks: '× N layers',
      condInput: 'Conditioning (t, c)',
      comparison: [
        ['Feature', 'U-Net', 'DiT'],
        ['Backbone', 'CNN (Convolution)', 'Transformer (Attention)'],
        ['Resolution', 'Fixed (architecture-bound)', 'Flexible (adjustable patch size)'],
        ['Scaling', 'Limited (arch bottleneck)', 'Continuous (more layers/heads)'],
        ['Conditioning', 'Cross-Attention', 'adaLN-Zero'],
      ],
    },
  }[locale]!;

  const [activeHighlight, setActiveHighlight] = useState<HighlightZone>(null);

  // Layout constants
  const midX = W / 2;
  const unetCx = 200;
  const ditCx = 600;

  // Shared vertical positions
  const inputY = 48;
  const topY = 80;
  const outputY = 330;
  const tableY = 370;

  function zoneColor(zone: HighlightZone): string {
    if (!activeHighlight) return COLORS.primary;
    return activeHighlight === zone ? COLORS.primary : COLORS.light;
  }

  function zoneOpacity(zone: HighlightZone): number {
    if (!activeHighlight) return 1;
    return activeHighlight === zone ? 1 : 0.25;
  }

  // U-Net encoder/decoder block widths (narrowing/widening for U-shape)
  const uBlockW = [130, 100, 70];
  const uBlockH = 36;
  const uGap = 8;

  // DiT block positions
  const ditBlockW = 120;
  const ditBlockH = 36;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="udit-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* Title */}
        <text x={midX} y={24} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Divider */}
        <line x1={midX} y1={35} x2={midX} y2={tableY - 5}
          stroke={COLORS.light} strokeWidth={1} strokeDasharray="4 4" />

        {/* --- U-Net Side --- */}
        <text x={unetCx} y={inputY - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.primary}>
          {t.unet}
        </text>

        {/* Input (shared) */}
        <motion.g
          onMouseEnter={() => setActiveHighlight('input')}
          onMouseLeave={() => setActiveHighlight(null)}
          style={{ cursor: 'pointer' }}
          animate={{ opacity: zoneOpacity('input') }}
        >
          <rect x={unetCx - 65} y={topY} width={130} height={28} rx={4}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={unetCx} y={topY + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.orange}>
            {t.input}
          </text>
        </motion.g>

        {/* U-Net Encoder (left side of U) */}
        <motion.g
          onMouseEnter={() => setActiveHighlight('backbone')}
          onMouseLeave={() => setActiveHighlight(null)}
          style={{ cursor: 'pointer' }}
          animate={{ opacity: zoneOpacity('backbone') }}
        >
          {uBlockW.map((bw, i) => {
            const bx = unetCx - bw / 2;
            const by = topY + 38 + i * (uBlockH + uGap);
            return (
              <g key={`enc-${i}`}>
                <motion.rect x={bx} y={by} width={bw} height={uBlockH} rx={4}
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                />
                <text x={unetCx} y={by + uBlockH / 2 + 3} textAnchor="middle" fontSize="9" fontWeight="500" fill={COLORS.primary}>
                  {t.encoder} {i + 1}
                </text>
                {/* Down arrow */}
                {i < uBlockW.length - 1 && (
                  <line x1={unetCx} y1={by + uBlockH + 1} x2={unetCx} y2={by + uBlockH + uGap - 1}
                    stroke={COLORS.primary} strokeWidth={1} markerEnd="url(#udit-arrow)" />
                )}
              </g>
            );
          })}

          {/* Bottleneck */}
          {(() => {
            const botY = topY + 38 + 3 * (uBlockH + uGap);
            return (
              <g>
                <motion.rect x={unetCx - 30} y={botY} width={60} height={uBlockH} rx={4}
                  fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1.5}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                />
                <text x={unetCx} y={botY + uBlockH / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="600" fill={COLORS.red}>
                  {t.bottleneck}
                </text>
              </g>
            );
          })()}

          {/* Decoder (right side of U, mirrored widths) */}
          {[...uBlockW].reverse().map((bw, i) => {
            const bx = unetCx - bw / 2;
            const by = topY + 38 + (4 + i) * (uBlockH + uGap);
            const encIdx = uBlockW.length - 1 - i;
            const encY = topY + 38 + encIdx * (uBlockH + uGap);
            return (
              <g key={`dec-${i}`}>
                <motion.rect x={bx} y={by} width={bw} height={uBlockH} rx={4}
                  fill="#ede9fe" stroke={COLORS.purple} strokeWidth={1.5}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                />
                <text x={unetCx} y={by + uBlockH / 2 + 3} textAnchor="middle" fontSize="9" fontWeight="500" fill={COLORS.purple}>
                  {t.decoder} {i + 1}
                </text>
                {/* Skip connection */}
                <motion.path
                  d={`M${unetCx + bw / 2 + 2},${encY + uBlockH / 2} C${unetCx + bw / 2 + 30},${encY + uBlockH / 2} ${unetCx + bw / 2 + 30},${by + uBlockH / 2} ${unetCx + bw / 2 + 2},${by + uBlockH / 2}`}
                  fill="none" stroke={COLORS.green} strokeWidth={1} strokeDasharray="3 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                />
              </g>
            );
          })}

          {/* Skip label */}
          <text x={unetCx + 95} y={topY + 38 + 2 * (uBlockH + uGap) + uBlockH / 2}
            textAnchor="start" fontSize="8" fill={COLORS.green} fontWeight="500">
            {t.skip}
          </text>
        </motion.g>

        {/* U-Net Output */}
        <motion.g
          onMouseEnter={() => setActiveHighlight('output')}
          onMouseLeave={() => setActiveHighlight(null)}
          style={{ cursor: 'pointer' }}
          animate={{ opacity: zoneOpacity('output') }}
        >
          <rect x={unetCx - 65} y={outputY} width={130} height={28} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={unetCx} y={outputY + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.green}>
            {t.output}
          </text>
        </motion.g>

        {/* U-Net description */}
        <text x={unetCx} y={outputY + 48} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.unetDesc}
        </text>

        {/* --- DiT Side --- */}
        <text x={ditCx} y={inputY - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={COLORS.green}>
          {t.dit}
        </text>

        {/* Input */}
        <motion.g
          onMouseEnter={() => setActiveHighlight('input')}
          onMouseLeave={() => setActiveHighlight(null)}
          style={{ cursor: 'pointer' }}
          animate={{ opacity: zoneOpacity('input') }}
        >
          <rect x={ditCx - 65} y={topY} width={130} height={28} rx={4}
            fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
          <text x={ditCx} y={topY + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.orange}>
            {t.input}
          </text>
        </motion.g>

        {/* DiT backbone */}
        <motion.g
          onMouseEnter={() => setActiveHighlight('backbone')}
          onMouseLeave={() => setActiveHighlight(null)}
          style={{ cursor: 'pointer' }}
          animate={{ opacity: zoneOpacity('backbone') }}
        >
          {/* Patchify */}
          {(() => {
            const py = topY + 42;
            return (
              <g>
                <line x1={ditCx} y1={topY + 28} x2={ditCx} y2={py}
                  stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#udit-arrow)" />
                <motion.rect x={ditCx - ditBlockW / 2} y={py} width={ditBlockW} height={30} rx={4}
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1.5}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                />
                <text x={ditCx} y={py + 17} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.primary}>
                  {t.patchify}
                </text>
              </g>
            );
          })()}

          {/* Conditioning input */}
          {(() => {
            const condX = ditCx + ditBlockW / 2 + 15;
            const condY = topY + 120;
            return (
              <g>
                <rect x={condX} y={condY} width={90} height={24} rx={12}
                  fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
                <text x={condX + 45} y={condY + 14} textAnchor="middle" fontSize="8" fontWeight="500" fill={COLORS.orange}>
                  {t.condInput}
                </text>
                <line x1={condX} y1={condY + 12} x2={ditCx + ditBlockW / 2 + 2} y2={condY + 12}
                  stroke={COLORS.orange} strokeWidth={1} strokeDasharray="3 2" />
              </g>
            );
          })()}

          {/* Transformer blocks */}
          {[0, 1, 2].map((i) => {
            const by = topY + 84 + i * (uBlockH + uGap + 8);
            return (
              <g key={`dit-block-${i}`}>
                <line x1={ditCx} y1={by - uGap + 1} x2={ditCx} y2={by}
                  stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#udit-arrow)" />
                <motion.rect x={ditCx - ditBlockW / 2} y={by} width={ditBlockW} height={uBlockH} rx={4}
                  fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                />
                <text x={ditCx} y={by + uBlockH / 2 + 3} textAnchor="middle" fontSize="9" fontWeight="500" fill={COLORS.orange}>
                  {t.transformerBlock}
                </text>
              </g>
            );
          })}

          {/* "× N layers" label */}
          <text x={ditCx - ditBlockW / 2 - 8} y={topY + 84 + 1.5 * (uBlockH + uGap + 8)}
            textAnchor="end" fontSize="10" fontWeight="600" fill={COLORS.orange}>
            {t.nBlocks}
          </text>

          {/* Unpatchify */}
          {(() => {
            const upy = topY + 84 + 3 * (uBlockH + uGap + 8) - 4;
            return (
              <g>
                <line x1={ditCx} y1={upy - uGap + 1} x2={ditCx} y2={upy}
                  stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#udit-arrow)" />
                <motion.rect x={ditCx - ditBlockW / 2} y={upy} width={ditBlockW} height={30} rx={4}
                  fill="#ede9fe" stroke={COLORS.purple} strokeWidth={1.5}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                />
                <text x={ditCx} y={upy + 17} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.purple}>
                  {t.unpatchify}
                </text>
              </g>
            );
          })()}
        </motion.g>

        {/* DiT Output */}
        <motion.g
          onMouseEnter={() => setActiveHighlight('output')}
          onMouseLeave={() => setActiveHighlight(null)}
          style={{ cursor: 'pointer' }}
          animate={{ opacity: zoneOpacity('output') }}
        >
          <rect x={ditCx - 65} y={outputY} width={130} height={28} rx={4}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={ditCx} y={outputY + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.green}>
            {t.output}
          </text>
        </motion.g>

        {/* DiT description */}
        <text x={ditCx} y={outputY + 48} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
          {t.ditDesc}
        </text>

        {/* Comparison table */}
        {(() => {
          const tw = 700;
          const tx = (W - tw) / 2;
          const rowH = 22;
          const colW = [140, 260, 260];
          const rows = t.comparison;

          return (
            <g>
              {rows.map((row, ri) => {
                const ry = tableY + ri * rowH;
                const isHeader = ri === 0;
                return (
                  <g key={`row-${ri}`}>
                    {/* Row background */}
                    <rect x={tx} y={ry} width={tw} height={rowH}
                      fill={isHeader ? COLORS.dark : ri % 2 === 0 ? COLORS.bgAlt : COLORS.bg}
                      rx={ri === 0 ? 3 : ri === rows.length - 1 ? 3 : 0} />
                    {/* Cell text */}
                    {row.map((cell, ci) => {
                      const cx = tx + colW.slice(0, ci).reduce((a, b) => a + b, 0) + colW[ci] / 2;
                      return (
                        <text key={`cell-${ri}-${ci}`} x={cx} y={ry + rowH / 2 + 3}
                          textAnchor="middle" fontSize="9"
                          fontWeight={isHeader || ci === 0 ? '600' : '400'}
                          fill={isHeader ? COLORS.bg : COLORS.dark}>
                          {cell}
                        </text>
                      );
                    })}
                    {/* Column separator lines */}
                    {[colW[0], colW[0] + colW[1]].map((cx, li) => (
                      <line key={`sep-${ri}-${li}`}
                        x1={tx + cx} y1={ry} x2={tx + cx} y2={ry + rowH}
                        stroke={isHeader ? COLORS.mid : COLORS.light} strokeWidth={0.5} />
                    ))}
                  </g>
                );
              })}
              {/* Table border */}
              <rect x={tx} y={tableY} width={tw} height={rows.length * rowH}
                fill="none" stroke={COLORS.light} strokeWidth={1} rx={3} />
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
