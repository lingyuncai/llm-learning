// src/components/interactive/MTPTrainInferBridge.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, HEAD_COLORS } from './shared/colors';

const HEADS = [
  { label: 'Head 1', desc: 'next token', trainTarget: 'Loss₁ (next)', inferRole: 'Verify (target)' },
  { label: 'Head 2', desc: 'next+1 token', trainTarget: 'Loss₂ (next+1)', inferRole: 'Draft token 1' },
  { label: 'Head 3', desc: 'next+2 token', trainTarget: 'Loss₃ (next+2)', inferRole: 'Draft token 2' },
];

const SVG_W = 480;
const SVG_H = 280;
const HALF_W = SVG_W / 2;

// Layout constants
const BACKBONE_W = 70;
const BACKBONE_H = 100;
const HEAD_W = 50;
const HEAD_H = 24;
const HEAD_GAP = 36;

export default function MTPTrainInferBridge({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      trainLabel: '训练时',
      inferLabel: '推理时',
      backbone: 'Backbone',
      shared: '(共享)',
      same: '(同一个)',
      inputTokens: 'Input Tokens',
      bridgeText: '训练的头 = 推理的 drafter',
      footerCore: 'MTP 核心:',
      footerDesc1: '训练时联合优化的多个预测头 → 推理时直接复用做 speculative draft',
      footerDesc2: '与 Medusa 不同: heads 和 backbone 一起训练，预测质量更高',
    },
    en: {
      trainLabel: 'Training',
      inferLabel: 'Inference',
      backbone: 'Backbone',
      shared: '(shared)',
      same: '(same)',
      inputTokens: 'Input Tokens',
      bridgeText: 'trained head = inference drafter',
      footerCore: 'MTP Core:',
      footerDesc1: 'Multiple prediction heads jointly optimized during training → directly reused as speculative draft during inference',
      footerDesc2: 'Unlike Medusa: heads and backbone trained together, better prediction quality',
    },
  }[locale];

  const [hoveredHead, setHoveredHead] = useState<number | null>(null);

  // Positions for left (train) and right (infer) sides
  const leftBackbone = { x: HALF_W / 2 - BACKBONE_W / 2, y: SVG_H - BACKBONE_H - 30 };
  const rightBackbone = { x: HALF_W + HALF_W / 2 - BACKBONE_W / 2, y: SVG_H - BACKBONE_H - 30 };

  const headY = (i: number) => leftBackbone.y - 30 - i * HEAD_GAP;

  return (
    <div className="space-y-2">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          {/* Center divider */}
          <line x1={HALF_W} y1={10} x2={HALF_W} y2={SVG_H - 10}
            stroke="#e5e7eb" strokeWidth={1} strokeDasharray="6,4" />

          {/* Side labels */}
          <text x={HALF_W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.primary} fontFamily="system-ui">{t.trainLabel}</text>
          <text x={HALF_W + HALF_W / 2} y={18} textAnchor="middle" fontSize="12" fontWeight="700"
            fill={COLORS.green} fontFamily="system-ui">{t.inferLabel}</text>

          {/* Left backbone */}
          <rect x={leftBackbone.x} y={leftBackbone.y} width={BACKBONE_W} height={BACKBONE_H}
            rx={8} fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
          <text x={leftBackbone.x + BACKBONE_W / 2} y={leftBackbone.y + BACKBONE_H / 2 - 6}
            textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.primary} fontFamily="system-ui">
            {t.backbone}
          </text>
          <text x={leftBackbone.x + BACKBONE_W / 2} y={leftBackbone.y + BACKBONE_H / 2 + 8}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            {t.shared}
          </text>
          {/* Input arrow */}
          <text x={leftBackbone.x + BACKBONE_W / 2} y={SVG_H - 10}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            {t.inputTokens}
          </text>
          <line x1={leftBackbone.x + BACKBONE_W / 2} y1={SVG_H - 14}
            x2={leftBackbone.x + BACKBONE_W / 2} y2={leftBackbone.y + BACKBONE_H}
            stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mtp-arrow)" />

          {/* Right backbone */}
          <rect x={rightBackbone.x} y={rightBackbone.y} width={BACKBONE_W} height={BACKBONE_H}
            rx={8} fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
          <text x={rightBackbone.x + BACKBONE_W / 2} y={rightBackbone.y + BACKBONE_H / 2 - 6}
            textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.green} fontFamily="system-ui">
            {t.backbone}
          </text>
          <text x={rightBackbone.x + BACKBONE_W / 2} y={rightBackbone.y + BACKBONE_H / 2 + 8}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            {t.same}
          </text>
          <text x={rightBackbone.x + BACKBONE_W / 2} y={SVG_H - 10}
            textAnchor="middle" fontSize="8" fill={COLORS.mid} fontFamily="system-ui">
            {t.inputTokens}
          </text>
          <line x1={rightBackbone.x + BACKBONE_W / 2} y1={SVG_H - 14}
            x2={rightBackbone.x + BACKBONE_W / 2} y2={rightBackbone.y + BACKBONE_H}
            stroke={COLORS.mid} strokeWidth={1} markerEnd="url(#mtp-arrow)" />

          <defs>
            <marker id="mtp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
          </defs>

          {/* Heads — left and right */}
          {HEADS.map((head, i) => {
            const y = headY(i);
            const isHovered = hoveredHead === i;
            const leftX = leftBackbone.x + BACKBONE_W / 2 - HEAD_W / 2;
            const rightX = rightBackbone.x + BACKBONE_W / 2 - HEAD_W / 2;
            const color = HEAD_COLORS[i];

            return (
              <g key={i}
                onMouseEnter={() => setHoveredHead(i)}
                onMouseLeave={() => setHoveredHead(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Left head */}
                <motion.rect x={leftX} y={y} width={HEAD_W} height={HEAD_H}
                  rx={4}
                  fill={isHovered ? `${color}30` : `${color}15`}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  animate={{ strokeWidth: isHovered ? 2 : 1 }}
                />
                <text x={leftX + HEAD_W / 2} y={y + HEAD_H / 2 + 3}
                  textAnchor="middle" fontSize="8" fontWeight="600" fill={color}
                  fontFamily="system-ui">{head.label}</text>
                {/* Left target */}
                <text x={leftX - 6} y={y + HEAD_H / 2 + 3}
                  textAnchor="end" fontSize="7" fill={isHovered ? color : COLORS.mid}
                  fontFamily="system-ui">{head.trainTarget}</text>
                {/* Connection line from backbone */}
                <line x1={leftBackbone.x + BACKBONE_W / 2} y1={leftBackbone.y}
                  x2={leftX + HEAD_W / 2} y2={y + HEAD_H}
                  stroke={color} strokeWidth={isHovered ? 1.5 : 0.8} opacity={0.5} />

                {/* Right head */}
                <motion.rect x={rightX} y={y} width={HEAD_W} height={HEAD_H}
                  rx={4}
                  fill={isHovered ? `${color}30` : `${color}15`}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  animate={{ strokeWidth: isHovered ? 2 : 1 }}
                />
                <text x={rightX + HEAD_W / 2} y={y + HEAD_H / 2 + 3}
                  textAnchor="middle" fontSize="8" fontWeight="600" fill={color}
                  fontFamily="system-ui">{head.label}</text>
                {/* Right role */}
                <text x={rightX + HEAD_W + 6} y={y + HEAD_H / 2 + 3}
                  textAnchor="start" fontSize="7" fill={isHovered ? color : COLORS.mid}
                  fontFamily="system-ui">{head.inferRole}</text>
                {/* Connection line from backbone */}
                <line x1={rightBackbone.x + BACKBONE_W / 2} y1={rightBackbone.y}
                  x2={rightX + HEAD_W / 2} y2={y + HEAD_H}
                  stroke={color} strokeWidth={isHovered ? 1.5 : 0.8} opacity={0.5} />

                {/* Bridge dashed arrow */}
                <motion.line
                  x1={leftX + HEAD_W} y1={y + HEAD_H / 2}
                  x2={rightX} y2={y + HEAD_H / 2}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeDasharray="4,3"
                  opacity={isHovered ? 0.9 : 0.3}
                  animate={{ opacity: isHovered ? 0.9 : 0.3 }}
                />
                {isHovered && (
                  <motion.text
                    x={HALF_W} y={y + HEAD_H / 2 - 6}
                    textAnchor="middle" fontSize="7" fill={color}
                    fontFamily="system-ui" fontWeight="600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {t.bridgeText}
                  </motion.text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-gray-500 text-center">
        <strong>{t.footerCore}</strong> {t.footerDesc1}
        <br />
        {t.footerDesc2}
      </p>
    </div>
  );
}
