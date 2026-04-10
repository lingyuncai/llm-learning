/**
 * GPTStackDiagram — Interactive diagram showing how Transformer blocks
 * are stacked to form a complete decoder-only LLM (e.g. GPT, LLaMA).
 *
 * Shows the full pipeline:
 *   Input Text → Tokenizer → Token Embedding + Positional Encoding →
 *   [Transformer Block ×N] → Final LayerNorm → LM Head → Softmax → Next Token
 *
 * Users can select a model to see its specific hyperparameters annotated.
 */
import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

// ── Model configs ──
interface ModelConfig {
  name: string;
  layers: number;
  hidden: number;
  heads: number;
  headDim: number;
  ffnDim: number;
  vocab: number;
  ctxLen: number | string;
  params: string;
  posEnc: string;
  norm: string;
  activation: string;
}

const MODELS: Record<string, ModelConfig> = {
  'gpt2': {
    name: 'GPT-2 Small',
    layers: 12, hidden: 768, heads: 12, headDim: 64,
    ffnDim: 3072, vocab: 50257, ctxLen: 1024, params: '117M',
    posEnc: 'Learned Abs.', norm: 'Pre-LN', activation: 'GELU',
  },
  'gpt2-xl': {
    name: 'GPT-2 XL',
    layers: 48, hidden: 1600, heads: 25, headDim: 64,
    ffnDim: 6400, vocab: 50257, ctxLen: 1024, params: '1.5B',
    posEnc: 'Learned Abs.', norm: 'Pre-LN', activation: 'GELU',
  },
  'llama-7b': {
    name: 'LLaMA-7B',
    layers: 32, hidden: 4096, heads: 32, headDim: 128,
    ffnDim: 11008, vocab: 32000, ctxLen: 2048, params: '6.7B',
    posEnc: 'RoPE', norm: 'Pre-RMSNorm', activation: 'SwiGLU',
  },
  'llama-3.1-8b': {
    name: 'LLaMA-3.1-8B',
    layers: 32, hidden: 4096, heads: 32, headDim: 128,
    ffnDim: 14336, vocab: 128256, ctxLen: '131072', params: '8B',
    posEnc: 'RoPE', norm: 'Pre-RMSNorm', activation: 'SwiGLU',
  },
};

// ── i18n ──
const TEXTS = {
  zh: {
    title: '选择模型查看配置：',
    inputText: '输入文本',
    tokenizer: 'Tokenizer',
    tokenIds: 'Token IDs',
    tokenEmb: 'Token Embedding',
    posEnc: 'Positional Encoding',
    add: '+',
    transformerBlock: 'Transformer Block',
    layerNorm: 'LayerNorm',
    selfAttn: 'Self-Attention',
    ffn: 'FFN (MLP)',
    residual: 'Residual',
    finalNorm: 'Final LayerNorm',
    lmHead: 'LM Head (Linear)',
    softmax: 'Softmax',
    nextToken: '下一个 Token',
    layers: '层数',
    hiddenDim: '隐藏维度',
    vocabSize: '词表大小',
    ctxLen: '上下文长度',
    totalParams: '总参数',
    caption: 'Decoder-only LLM 完整架构 — 从输入文本到下一个 Token 的完整数据流',
    blockInternals: 'Block 内部',
    repeated: '重复',
    times: '次',
  },
  en: {
    title: 'Select model to view config:',
    inputText: 'Input Text',
    tokenizer: 'Tokenizer',
    tokenIds: 'Token IDs',
    tokenEmb: 'Token Embedding',
    posEnc: 'Positional Encoding',
    add: '+',
    transformerBlock: 'Transformer Block',
    layerNorm: 'LayerNorm',
    selfAttn: 'Self-Attention',
    ffn: 'FFN (MLP)',
    residual: 'Residual',
    finalNorm: 'Final LayerNorm',
    lmHead: 'LM Head (Linear)',
    softmax: 'Softmax',
    nextToken: 'Next Token',
    layers: 'Layers',
    hiddenDim: 'Hidden dim',
    vocabSize: 'Vocab size',
    ctxLen: 'Context len',
    totalParams: 'Total params',
    caption: 'Complete Decoder-only LLM Architecture — Full data flow from input text to next token prediction',
    blockInternals: 'Block internals',
    repeated: 'repeated',
    times: 'times',
  },
};

// ── Drawing helpers ──
const BW = 200;    // block width
const BH = 38;     // block height
const GAP = 14;    // gap between blocks
const CX = 230;    // center x of the main column
const SVG_W = 520;

function RoundedBlock({ x, y, w, h, label, fill, stroke, fontWeight = '500', fontSize = 12 }: {
  x: number; y: number; w: number; h: number; label: string;
  fill: string; stroke: string; fontWeight?: string; fontSize?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={7} ry={7}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 + 4.5} textAnchor="middle"
        fontSize={fontSize} fontWeight={fontWeight} fill={COLORS.dark} fontFamily={FONTS.sans}>
        {label}
      </text>
    </g>
  );
}

function DownArrow({ cx, y1, y2 }: { cx: number; y1: number; y2: number }) {
  return (
    <line x1={cx} y1={y1} x2={cx} y2={y2}
      stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#gptStackArrow)" />
  );
}

function DashedRightArrow({ x1, y1, x2, y2, color = COLORS.primary }: {
  x1: number; y1: number; x2: number; y2: number; color?: string;
}) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={1.2} strokeDasharray="4 3" />
  );
}

// ── Main Component ──
export default function GPTStackDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [modelKey, setModelKey] = useState('gpt2');
  const model = MODELS[modelKey];
  const t = TEXTS[locale];

  // Vertical layout positions
  let y = 20;
  const pos: Record<string, number> = {};
  const step = (key: string, height = BH) => {
    pos[key] = y;
    y += height + GAP;
    return pos[key];
  };

  step('inputText');
  step('tokenizer');
  step('tokenEmb');
  step('posEnc');
  // The stacked transformer blocks zone
  const blockZoneStart = y;
  step('block1');
  step('block2');
  step('blockDots', 24);
  step('blockN');
  const blockZoneEnd = y - GAP;
  step('finalNorm');
  step('lmHead');
  step('softmax');
  step('nextToken');

  const SVG_H = y + 10;

  // Expanded block internals position (right side panel)
  const panelX = CX + BW / 2 + 50;
  const panelW = 140;

  return (
    <figure className="my-8 flex flex-col items-center">
      {/* Model selector */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <span className="text-sm text-gray-500 self-center mr-1">{t.title}</span>
        {Object.entries(MODELS).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setModelKey(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              modelKey === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ maxWidth: `${SVG_W}px` }}
        role="img" aria-label="GPT architecture stack diagram">
        <defs>
          <marker id="gptStackArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} />
          </marker>
          <marker id="gptStackArrowBlue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.primary} />
          </marker>
        </defs>

        {/* ── Main pipeline ── */}

        {/* Input text */}
        <RoundedBlock x={CX - BW / 2} y={pos.inputText} w={BW} h={BH}
          label={t.inputText} fill="#f0fdf4" stroke="#86efac" />
        <DownArrow cx={CX} y1={pos.inputText + BH} y2={pos.tokenizer} />

        {/* Tokenizer */}
        <RoundedBlock x={CX - BW / 2} y={pos.tokenizer} w={BW} h={BH}
          label={t.tokenizer} fill="#fef3c7" stroke="#fcd34d" />
        {/* shape annotation */}
        <text x={CX + BW / 2 + 8} y={pos.tokenizer + BH / 2 + 4} fontSize="10"
          fill={COLORS.mid} fontFamily={FONTS.mono}>
          (B, S)
        </text>
        <DownArrow cx={CX} y1={pos.tokenizer + BH} y2={pos.tokenEmb} />

        {/* Token Embedding */}
        <RoundedBlock x={CX - BW / 2} y={pos.tokenEmb} w={BW} h={BH}
          label={`${t.tokenEmb}  [V×H]`} fill="#e0f2fe" stroke="#7dd3fc" />
        <text x={CX + BW / 2 + 8} y={pos.tokenEmb + BH / 2 + 4} fontSize="10"
          fill={COLORS.mid} fontFamily={FONTS.mono}>
          (B, S, {model.hidden})
        </text>
        <DownArrow cx={CX} y1={pos.tokenEmb + BH} y2={pos.posEnc} />

        {/* Positional Encoding */}
        <RoundedBlock x={CX - BW / 2} y={pos.posEnc} w={BW} h={BH}
          label={`+ ${t.posEnc}`} fill="#e0f2fe" stroke="#7dd3fc" />
        <text x={CX + BW / 2 + 8} y={pos.posEnc + BH / 2 + 4} fontSize="10"
          fill={COLORS.primary} fontFamily={FONTS.sans} fontWeight="600">
          {model.posEnc}
        </text>
        <DownArrow cx={CX} y1={pos.posEnc + BH} y2={pos.block1} />

        {/* ── Transformer Block Stack ── */}

        {/* Background for the repeated block zone */}
        <rect x={CX - BW / 2 - 16} y={blockZoneStart - 6}
          width={BW + 32} height={blockZoneEnd - blockZoneStart + 12}
          rx={10} ry={10}
          fill="none" stroke={COLORS.primary} strokeWidth={2} strokeDasharray="6 4" />

        {/* Repeat label */}
        <text x={CX - BW / 2 - 22} y={(blockZoneStart + blockZoneEnd) / 2 + 4}
          textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.primary}
          fontFamily={FONTS.sans}
          transform={`rotate(-90, ${CX - BW / 2 - 22}, ${(blockZoneStart + blockZoneEnd) / 2 + 4})`}>
          ×{model.layers}
        </text>

        {/* Block 1 */}
        <RoundedBlock x={CX - BW / 2} y={pos.block1} w={BW} h={BH}
          label={`${t.transformerBlock} #1`} fill="#dbeafe" stroke={COLORS.primary}
          fontWeight="600" />
        <DownArrow cx={CX} y1={pos.block1 + BH} y2={pos.block2} />

        {/* Block 2 */}
        <RoundedBlock x={CX - BW / 2} y={pos.block2} w={BW} h={BH}
          label={`${t.transformerBlock} #2`} fill="#dbeafe" stroke={COLORS.primary}
          fontWeight="600" />
        <DownArrow cx={CX} y1={pos.block2 + BH} y2={pos.blockDots} />

        {/* Dots */}
        <text x={CX} y={pos.blockDots + 16} textAnchor="middle" fontSize="18"
          fill={COLORS.mid} fontFamily={FONTS.sans} fontWeight="700">
          ⋮
        </text>
        <DownArrow cx={CX} y1={pos.blockDots + 24} y2={pos.blockN} />

        {/* Block N */}
        <RoundedBlock x={CX - BW / 2} y={pos.blockN} w={BW} h={BH}
          label={`${t.transformerBlock} #${model.layers}`} fill="#dbeafe" stroke={COLORS.primary}
          fontWeight="600" />
        <DownArrow cx={CX} y1={pos.blockN + BH} y2={pos.finalNorm} />

        {/* ── Post-stack layers ── */}

        {/* Final LayerNorm */}
        <RoundedBlock x={CX - BW / 2} y={pos.finalNorm} w={BW} h={BH}
          label={t.finalNorm} fill="#fef3c7" stroke="#fcd34d" />
        <text x={CX + BW / 2 + 8} y={pos.finalNorm + BH / 2 + 4} fontSize="10"
          fill={COLORS.primary} fontFamily={FONTS.sans} fontWeight="600">
          {model.norm.replace('Pre-', '')}
        </text>
        <DownArrow cx={CX} y1={pos.finalNorm + BH} y2={pos.lmHead} />

        {/* LM Head */}
        <RoundedBlock x={CX - BW / 2} y={pos.lmHead} w={BW} h={BH}
          label={t.lmHead} fill="#ede9fe" stroke="#a78bfa" fontWeight="600" />
        <text x={CX + BW / 2 + 8} y={pos.lmHead + BH / 2 + 4} fontSize="10"
          fill={COLORS.mid} fontFamily={FONTS.mono}>
          (B, S, {model.vocab})
        </text>
        <DownArrow cx={CX} y1={pos.lmHead + BH} y2={pos.softmax} />

        {/* Softmax */}
        <RoundedBlock x={CX - BW / 2} y={pos.softmax} w={BW} h={BH}
          label={t.softmax} fill="#fce7f3" stroke="#f9a8d4" />
        <DownArrow cx={CX} y1={pos.softmax + BH} y2={pos.nextToken} />

        {/* Next Token */}
        <RoundedBlock x={CX - BW / 2} y={pos.nextToken} w={BW} h={BH}
          label={t.nextToken} fill="#f0fdf4" stroke="#86efac" fontWeight="600" />

        {/* ── Right side: expanded block internals ── */}
        {(() => {
          const py = pos.block1 - 2;
          const internalH = (blockZoneEnd - blockZoneStart) + 8;
          const subBH = 30;
          const subGap = 8;
          const subCX = panelX + panelW / 2;
          let sy = py + 28;

          const subBlocks: { label: string; fill: string; stroke: string }[] = [
            { label: model.norm.replace('Pre-', ''), fill: '#fef3c7', stroke: '#fcd34d' },
            { label: `${t.selfAttn}`, fill: '#dbeafe', stroke: COLORS.primary },
            { label: `⊕ ${t.residual}`, fill: '#f0fdf4', stroke: '#86efac' },
            { label: model.norm.replace('Pre-', ''), fill: '#fef3c7', stroke: '#fcd34d' },
            { label: `${t.ffn} (${model.activation})`, fill: '#ede9fe', stroke: '#a78bfa' },
            { label: `⊕ ${t.residual}`, fill: '#f0fdf4', stroke: '#86efac' },
          ];

          return (
            <g>
              {/* Panel background */}
              <rect x={panelX - 6} y={py} width={panelW + 12} height={internalH}
                rx={8} ry={8} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
              <text x={subCX} y={py + 16} textAnchor="middle" fontSize="10"
                fill={COLORS.mid} fontFamily={FONTS.sans} fontWeight="600">
                {t.blockInternals}
              </text>

              {/* Connection line from block 1 to panel */}
              <DashedRightArrow x1={CX + BW / 2} y1={pos.block1 + BH / 2}
                x2={panelX - 6} y2={py + internalH / 2} />

              {/* Sub-blocks */}
              {subBlocks.map((sb, i) => {
                const by = sy + i * (subBH + subGap);
                return (
                  <g key={i}>
                    <RoundedBlock x={panelX} y={by} w={panelW} h={subBH}
                      label={sb.label} fill={sb.fill} stroke={sb.stroke} fontSize={10} />
                    {i < subBlocks.length - 1 && (
                      <DownArrow cx={subCX} y1={by + subBH} y2={by + subBH + subGap} />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })()}
      </svg>

      {/* Stats bar */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 justify-center text-xs text-gray-500 font-mono">
        <span>{t.layers}: <strong className="text-gray-700">{model.layers}</strong></span>
        <span>{t.hiddenDim}: <strong className="text-gray-700">{model.hidden}</strong></span>
        <span>{t.vocabSize}: <strong className="text-gray-700">{model.vocab.toLocaleString()}</strong></span>
        <span>{t.ctxLen}: <strong className="text-gray-700">{typeof model.ctxLen === 'number' ? model.ctxLen.toLocaleString() : Number(model.ctxLen).toLocaleString()}</strong></span>
        <span>{t.totalParams}: <strong className="text-gray-700">{model.params}</strong></span>
      </div>
      <figcaption className="text-sm text-gray-500 mt-2 text-center max-w-lg">
        {t.caption}
      </figcaption>
    </figure>
  );
}
