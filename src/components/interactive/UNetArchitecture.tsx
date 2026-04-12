import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

interface BlockInfo {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export default function UNetArchitecture({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'U-Net 去噪网络架构',
      encoder: '编码器 (下采样)',
      decoder: '解码器 (上采样)',
      bottleneck: '瓶颈层',
      skipConn: 'Skip Connection',
      timestepEmb: '时间步嵌入 t',
      input: '噪声图像 xₜ',
      output: '预测噪声 εθ',
      hoverHint: '悬停查看详情',
      blocks: {
        enc1: { label: '64×64, 64ch', detail: '2× ResBlock + Self-Attention, 下采样 ↓2' },
        enc2: { label: '32×32, 128ch', detail: '2× ResBlock + Self-Attention, 下采样 ↓2' },
        enc3: { label: '16×16, 256ch', detail: '2× ResBlock + Cross-Attention, 下采样 ↓2' },
        enc4: { label: '8×8, 512ch', detail: '2× ResBlock + Cross-Attention, 下采样 ↓2' },
        mid: { label: '8×8, 512ch', detail: 'ResBlock + Self-Attention + ResBlock + 时间步注入' },
        dec4: { label: '8→16, 512ch', detail: '上采样 ↑2 + concat skip + 2× ResBlock' },
        dec3: { label: '16→32, 256ch', detail: '上采样 ↑2 + concat skip + 2× ResBlock' },
        dec2: { label: '32→64, 128ch', detail: '上采样 ↑2 + concat skip + 2× ResBlock' },
        dec1: { label: '64×64, 64ch', detail: '上采样 + concat skip + 2× ResBlock + 输出卷积' },
      },
    },
    en: {
      title: 'U-Net Denoising Architecture',
      encoder: 'Encoder (Downsample)',
      decoder: 'Decoder (Upsample)',
      bottleneck: 'Bottleneck',
      skipConn: 'Skip Connection',
      timestepEmb: 'Timestep embedding t',
      input: 'Noisy image xₜ',
      output: 'Predicted noise εθ',
      hoverHint: 'Hover for details',
      blocks: {
        enc1: { label: '64×64, 64ch', detail: '2× ResBlock + Self-Attention, downsample ↓2' },
        enc2: { label: '32×32, 128ch', detail: '2× ResBlock + Self-Attention, downsample ↓2' },
        enc3: { label: '16×16, 256ch', detail: '2× ResBlock + Cross-Attention, downsample ↓2' },
        enc4: { label: '8×8, 512ch', detail: '2× ResBlock + Cross-Attention, downsample ↓2' },
        mid: { label: '8×8, 512ch', detail: 'ResBlock + Self-Attn + ResBlock + timestep injection' },
        dec4: { label: '8→16, 512ch', detail: 'Upsample ↑2 + concat skip + 2× ResBlock' },
        dec3: { label: '16→32, 256ch', detail: 'Upsample ↑2 + concat skip + 2× ResBlock' },
        dec2: { label: '32→64, 128ch', detail: 'Upsample ↑2 + concat skip + 2× ResBlock' },
        dec1: { label: '64×64, 64ch', detail: 'Upsample + concat skip + 2× ResBlock + output conv' },
      },
    },
  }[locale]!;

  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  // U-shape layout: encoder left descending, bottleneck bottom center, decoder right ascending
  const blockW = 120;
  const encX = 80;
  const decX = 600;
  const levels = [
    { y: 70, h: 55 },    // Level 1: 64×64
    { y: 145, h: 55 },   // Level 2: 32×32
    { y: 220, h: 55 },   // Level 3: 16×16
    { y: 295, h: 55 },   // Level 4: 8×8
  ];
  const midY = 380;
  const midH = 50;
  const midX = 340;
  const midW = 120;

  // Block colors by depth
  const encColors = [COLORS.primary, '#1976d2', '#1e88e5', '#2196f3'];
  const decColors = [COLORS.green, '#388e3c', '#43a047', '#4caf50'];

  const blocks: BlockInfo[] = [
    { id: 'enc1', label: t.blocks.enc1.label, detail: t.blocks.enc1.detail, x: encX, y: levels[0].y, w: blockW, h: levels[0].h, color: encColors[0] },
    { id: 'enc2', label: t.blocks.enc2.label, detail: t.blocks.enc2.detail, x: encX, y: levels[1].y, w: blockW, h: levels[1].h, color: encColors[1] },
    { id: 'enc3', label: t.blocks.enc3.label, detail: t.blocks.enc3.detail, x: encX, y: levels[2].y, w: blockW, h: levels[2].h, color: encColors[2] },
    { id: 'enc4', label: t.blocks.enc4.label, detail: t.blocks.enc4.detail, x: encX, y: levels[3].y, w: blockW, h: levels[3].h, color: encColors[3] },
    { id: 'mid',  label: t.blocks.mid.label,  detail: t.blocks.mid.detail,  x: midX, y: midY, w: midW, h: midH, color: COLORS.purple },
    { id: 'dec4', label: t.blocks.dec4.label, detail: t.blocks.dec4.detail, x: decX, y: levels[3].y, w: blockW, h: levels[3].h, color: decColors[3] },
    { id: 'dec3', label: t.blocks.dec3.label, detail: t.blocks.dec3.detail, x: decX, y: levels[2].y, w: blockW, h: levels[2].h, color: decColors[2] },
    { id: 'dec2', label: t.blocks.dec2.label, detail: t.blocks.dec2.detail, x: decX, y: levels[1].y, w: blockW, h: levels[1].h, color: decColors[1] },
    { id: 'dec1', label: t.blocks.dec1.label, detail: t.blocks.dec1.detail, x: decX, y: levels[0].y, w: blockW, h: levels[0].h, color: decColors[0] },
  ];

  // Skip connection pairs (encoder → decoder at same level)
  const skipPairs = [
    { enc: 'enc1', dec: 'dec1', level: 0 },
    { enc: 'enc2', dec: 'dec2', level: 1 },
    { enc: 'enc3', dec: 'dec3', level: 2 },
    { enc: 'enc4', dec: 'dec4', level: 3 },
  ];

  const hoveredInfo = hoveredBlock ? blocks.find(b => b.id === hoveredBlock) : null;

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <defs>
          <marker id="unet-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} />
          </marker>
          <marker id="unet-arrow-orange" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.orange} />
          </marker>
        </defs>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Column labels */}
        <text x={encX + blockW / 2} y={58} textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.primary}>
          {t.encoder}
        </text>
        <text x={decX + blockW / 2} y={58} textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.green}>
          {t.decoder}
        </text>

        {/* Skip connections (drawn first, behind blocks) */}
        {skipPairs.map(({ enc, dec, level }) => {
          const ey = levels[level].y + levels[level].h / 2;
          const isHighlighted = hoveredBlock === enc || hoveredBlock === dec;
          return (
            <motion.line
              key={`skip-${level}`}
              x1={encX + blockW + 2} y1={ey}
              x2={decX - 2} y2={ey}
              stroke={COLORS.orange}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeDasharray="6,4"
              opacity={isHighlighted ? 1 : 0.4}
              markerEnd="url(#unet-arrow-orange)"
              animate={{
                strokeWidth: isHighlighted ? 2.5 : 1.5,
                opacity: isHighlighted ? 1 : 0.4,
              }}
              transition={{ duration: 0.2 }}
            />
          );
        })}

        {/* Skip connection label */}
        <text x={W / 2} y={levels[0].y + levels[0].h / 2 - 8} textAnchor="middle"
          fontSize="9" fill={COLORS.orange} fontWeight="500">
          {t.skipConn}
        </text>

        {/* Encoder downward arrows */}
        {[0, 1, 2].map((i) => (
          <line key={`enc-arrow-${i}`}
            x1={encX + blockW / 2} y1={levels[i].y + levels[i].h + 2}
            x2={encX + blockW / 2} y2={levels[i + 1].y - 2}
            stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#unet-arrow)" />
        ))}

        {/* Encoder to bottleneck */}
        <path
          d={`M${encX + blockW / 2},${levels[3].y + levels[3].h + 2} L${encX + blockW / 2},${midY - 5} L${midX - 2},${midY + midH / 2}`}
          fill="none" stroke={COLORS.mid} strokeWidth={1.5}
        />

        {/* Bottleneck to decoder */}
        <path
          d={`M${midX + midW + 2},${midY + midH / 2} L${decX + blockW / 2},${midY - 5} L${decX + blockW / 2},${levels[3].y + levels[3].h + 2}`}
          fill="none" stroke={COLORS.mid} strokeWidth={1.5}
        />

        {/* Decoder upward arrows */}
        {[3, 2, 1].map((i) => (
          <line key={`dec-arrow-${i}`}
            x1={decX + blockW / 2} y1={levels[i].y - 2}
            x2={decX + blockW / 2} y2={levels[i - 1].y + levels[i - 1].h + 2}
            stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#unet-arrow)" />
        ))}

        {/* Timestep embedding arrow to bottleneck */}
        <text x={midX + midW / 2} y={midY + midH + 25} textAnchor="middle" fontSize="10"
          fontWeight="600" fill={COLORS.purple}>
          {t.timestepEmb}
        </text>
        <line x1={midX + midW / 2} y1={midY + midH + 12} x2={midX + midW / 2} y2={midY + midH + 2}
          stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#unet-arrow)" />

        {/* Input label */}
        <text x={encX + blockW / 2} y={levels[0].y - 8} textAnchor="middle" fontSize="10"
          fill={COLORS.mid} fontWeight="500">
          {t.input}
        </text>

        {/* Output label */}
        <text x={decX + blockW / 2} y={levels[0].y - 8} textAnchor="middle" fontSize="10"
          fill={COLORS.mid} fontWeight="500">
          {t.output}
        </text>

        {/* Render blocks */}
        {blocks.map((block) => {
          const isHovered = hoveredBlock === block.id;
          return (
            <motion.g
              key={block.id}
              onMouseEnter={() => setHoveredBlock(block.id)}
              onMouseLeave={() => setHoveredBlock(null)}
              style={{ cursor: 'pointer' }}
            >
              <motion.rect
                x={block.x} y={block.y}
                width={block.w} height={block.h}
                fill={isHovered ? block.color : COLORS.bg}
                stroke={block.color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                rx={6}
                animate={{
                  fill: isHovered ? block.color : COLORS.bg,
                  strokeWidth: isHovered ? 2.5 : 1.5,
                }}
                transition={{ duration: 0.15 }}
              />
              <text
                x={block.x + block.w / 2} y={block.y + block.h / 2 - 5}
                textAnchor="middle" fontSize="10" fontWeight="600"
                fill={isHovered ? COLORS.bg : block.color}
              >
                {block.id.replace('enc', 'E').replace('dec', 'D').replace('mid', 'M')}
              </text>
              <text
                x={block.x + block.w / 2} y={block.y + block.h / 2 + 10}
                textAnchor="middle" fontSize="8"
                fill={isHovered ? COLORS.bg : COLORS.mid}
                fontFamily={FONTS.mono}
              >
                {block.label}
              </text>
            </motion.g>
          );
        })}

        {/* Hover detail tooltip */}
        {hoveredInfo && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <rect x={250} y={H - 45} width={300} height={28}
              fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} rx={5} />
            <text x={400} y={H - 26} textAnchor="middle" fontSize="11" fill={COLORS.dark} fontWeight="500">
              {hoveredInfo.detail}
            </text>
          </motion.g>
        )}

        {/* Hint text */}
        {!hoveredBlock && (
          <text x={W / 2} y={H - 30} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
            {t.hoverHint}
          </text>
        )}
      </svg>
    </div>
  );
}
