// src/components/interactive/EagleArchitecture.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS } from './shared/colors';

type Locale = 'zh' | 'en';

const SVG_W = 480;
const SVG_H = 260;
const ROW_H = 100;
const ROW_GAP = 40;
const TOP_Y = 20;
const BOT_Y = TOP_Y + ROW_H + ROW_GAP;

const BOX_H = 36;
const BOX_RX = 6;

export default function EagleArchitecture({ locale = 'zh' }: { locale?: Locale }) {
  const t = {
    zh: {
      traditionalLabel: '传统 Draft Model',
      tokenEmbedding: 'Token',
      embedding: 'Embedding',
      lessInfo: '信息少 ↓',
      smallModel: '小模型 (68M)',
      independentParams: '独立参数',
      draftTokens: 'Draft Tokens',
      eagleLabel: 'Eagle — Feature-Level Drafting',
      hiddenStates: 'Hidden States',
      targetLastLayer: 'Target 最后一层',
      richInfo: '信息丰富 ↑',
      lightweightDecoder: '轻量 Decoder',
      oneLayer: '1 层',
      comparisonNote: 'Hidden state 包含完整上下文语义 → Eagle 的 acceptance rate 比 Medusa 高 ~10-15%',
      keyInsight: '关键洞察:',
      insightDetail: 'Token embedding 只有 token 本身的信息，而 hidden state 编码了完整上下文、语义关系、语法模式',
    },
    en: {
      traditionalLabel: 'Traditional Draft Model',
      tokenEmbedding: 'Token',
      embedding: 'Embedding',
      lessInfo: 'Less info ↓',
      smallModel: 'Small model (68M)',
      independentParams: 'Independent params',
      draftTokens: 'Draft Tokens',
      eagleLabel: 'Eagle — Feature-Level Drafting',
      hiddenStates: 'Hidden States',
      targetLastLayer: 'Target last layer',
      richInfo: 'Rich info ↑',
      lightweightDecoder: 'Lightweight Decoder',
      oneLayer: '1 layer',
      comparisonNote: 'Hidden state contains full context semantics → Eagle acceptance rate ~10-15% higher than Medusa',
      keyInsight: 'Key insight:',
      insightDetail: 'Token embedding only has token info, while hidden state encodes full context, semantic relations, syntactic patterns',
    },
  }[locale];

  const [hovered, setHovered] = useState<'traditional' | 'eagle' | null>(null);

  const traditionalOpacity = hovered === 'eagle' ? 0.3 : 1;
  const eagleOpacity = hovered === 'traditional' ? 0.3 : 1;

  return (
    <div className="space-y-2">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          <defs>
            <marker id="eagle-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.mid} />
            </marker>
            <marker id="eagle-arrow-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
            </marker>
          </defs>

          {/* ===== Traditional Draft Model (top) ===== */}
          <motion.g
            onMouseEnter={() => setHovered('traditional')}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
            animate={{ opacity: traditionalOpacity }}
          >
            {/* Label */}
            <text x={10} y={TOP_Y + 10} fontSize="10" fontWeight="700" fill={COLORS.orange}
              fontFamily="system-ui">{t.traditionalLabel}</text>

            {/* Token Embedding box */}
            <rect x={30} y={TOP_Y + 25} width={90} height={BOX_H} rx={BOX_RX}
              fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={75} y={TOP_Y + 25 + BOX_H / 2 - 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.orange} fontFamily="system-ui">{t.tokenEmbedding}</text>
            <text x={75} y={TOP_Y + 25 + BOX_H / 2 + 6} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.orange} fontFamily="system-ui">{t.embedding}</text>

            {/* Thin arrow → */}
            <line x1={125} y1={TOP_Y + 25 + BOX_H / 2} x2={175} y2={TOP_Y + 25 + BOX_H / 2}
              stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#eagle-arrow)" />
            <text x={150} y={TOP_Y + 20} textAnchor="middle" fontSize="7" fill={COLORS.orange}
              fontFamily="system-ui">{t.lessInfo}</text>

            {/* Small Model box */}
            <rect x={180} y={TOP_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#fff7ed" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={230} y={TOP_Y + 25 + BOX_H / 2 - 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.orange} fontFamily="system-ui">{t.smallModel}</text>
            <text x={230} y={TOP_Y + 25 + BOX_H / 2 + 6} textAnchor="middle" fontSize="7"
              fill={COLORS.mid} fontFamily="system-ui">{t.independentParams}</text>

            {/* Arrow → */}
            <line x1={285} y1={TOP_Y + 25 + BOX_H / 2} x2={335} y2={TOP_Y + 25 + BOX_H / 2}
              stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#eagle-arrow)" />

            {/* Draft Tokens */}
            <rect x={340} y={TOP_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={390} y={TOP_Y + 25 + BOX_H / 2 + 3} textAnchor="middle" fontSize="9"
              fontWeight="600" fill={COLORS.orange} fontFamily="system-ui">{t.draftTokens}</text>
          </motion.g>

          {/* ===== Divider ===== */}
          <line x1={20} y1={TOP_Y + ROW_H + ROW_GAP / 2} x2={SVG_W - 20} y2={TOP_Y + ROW_H + ROW_GAP / 2}
            stroke="#e5e7eb" strokeWidth={1} strokeDasharray="6,4" />
          <text x={SVG_W / 2} y={TOP_Y + ROW_H + ROW_GAP / 2 - 5} textAnchor="middle" fontSize="8"
            fill={COLORS.mid} fontFamily="system-ui">vs</text>

          {/* ===== Eagle (bottom) ===== */}
          <motion.g
            onMouseEnter={() => setHovered('eagle')}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
            animate={{ opacity: eagleOpacity }}
          >
            {/* Label */}
            <text x={10} y={BOT_Y + 10} fontSize="10" fontWeight="700" fill={COLORS.green}
              fontFamily="system-ui">{t.eagleLabel}</text>

            {/* Hidden States box */}
            <rect x={30} y={BOT_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={80} y={BOT_Y + 25 + BOX_H / 2 - 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.green} fontFamily="system-ui">{t.hiddenStates}</text>
            <text x={80} y={BOT_Y + 25 + BOX_H / 2 + 6} textAnchor="middle" fontSize="7"
              fill={COLORS.mid} fontFamily="system-ui">{t.targetLastLayer}</text>

            {/* THICK arrow → (rich info) */}
            <line x1={135} y1={BOT_Y + 25 + BOX_H / 2} x2={175} y2={BOT_Y + 25 + BOX_H / 2}
              stroke={COLORS.green} strokeWidth={4} markerEnd="url(#eagle-arrow-green)" />
            <text x={155} y={BOT_Y + 20} textAnchor="middle" fontSize="7" fill={COLORS.green}
              fontWeight="600" fontFamily="system-ui">{t.richInfo}</text>

            {/* Lightweight Decoder box */}
            <rect x={180} y={BOT_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#f0fdf4" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={230} y={BOT_Y + 25 + BOX_H / 2 - 4} textAnchor="middle" fontSize="8"
              fontWeight="600" fill={COLORS.green} fontFamily="system-ui">{t.lightweightDecoder}</text>
            <text x={230} y={BOT_Y + 25 + BOX_H / 2 + 6} textAnchor="middle" fontSize="7"
              fill={COLORS.mid} fontFamily="system-ui">{t.oneLayer}</text>

            {/* Arrow → */}
            <line x1={285} y1={BOT_Y + 25 + BOX_H / 2} x2={335} y2={BOT_Y + 25 + BOX_H / 2}
              stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#eagle-arrow-green)" />

            {/* Draft Tokens */}
            <rect x={340} y={BOT_Y + 25} width={100} height={BOX_H} rx={BOX_RX}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.5} />
            <text x={390} y={BOT_Y + 25 + BOX_H / 2 + 3} textAnchor="middle" fontSize="9"
              fontWeight="600" fill={COLORS.green} fontFamily="system-ui">{t.draftTokens}</text>
          </motion.g>

          {/* Info comparison annotation */}
          <text x={SVG_W / 2} y={SVG_H - 6} textAnchor="middle" fontSize="8" fill={COLORS.mid}
            fontFamily="system-ui">
            {t.comparisonNote}
          </text>
        </svg>
      </div>

      <p className="text-xs text-gray-500 text-center">
        <strong>{t.keyInsight}</strong> {t.insightDetail}
      </p>
    </div>
  );
}
