import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

export default function AdaLNZeroMechanism({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      title: 'adaLN-Zero 机制详解',
      condTitle: '条件输入',
      timestep: '时间步 t',
      classLabel: '类别 c',
      mlp: 'MLP',
      sixParams: '→ 6 个参数',
      params: ['γ₁', 'β₁', 'α₁', 'γ₂', 'β₂', 'α₂'],
      blockTitle: 'DiT Block',
      inputH: '输入 h',
      ln1: 'LayerNorm',
      adaLN1: 'adaLN (γ₁, β₁)',
      attn: 'Self-Attention',
      gate1: '× α₁ (gate)',
      residual1: '+ 残差',
      ln2: 'LayerNorm',
      adaLN2: 'adaLN (γ₂, β₂)',
      ffn: 'FFN',
      gate2: '× α₂ (gate)',
      residual2: '+ 残差',
      outputH: '输出 h\'',
      formula: 'adaLN(h, y) = γ(y) ⊙ LN(h) + β(y)',
      insight: 'α 初始化为 0 → 初始时每个 block 是恒等函数',
      zeroInit: '初始化 = 0',
      scaleShift: 'Scale & Shift',
    },
    en: {
      title: 'adaLN-Zero Mechanism',
      condTitle: 'Conditioning Input',
      timestep: 'Timestep t',
      classLabel: 'Class c',
      mlp: 'MLP',
      sixParams: '→ 6 parameters',
      params: ['γ₁', 'β₁', 'α₁', 'γ₂', 'β₂', 'α₂'],
      blockTitle: 'DiT Block',
      inputH: 'Input h',
      ln1: 'LayerNorm',
      adaLN1: 'adaLN (γ₁, β₁)',
      attn: 'Self-Attention',
      gate1: '× α₁ (gate)',
      residual1: '+ residual',
      ln2: 'LayerNorm',
      adaLN2: 'adaLN (γ₂, β₂)',
      ffn: 'FFN',
      gate2: '× α₂ (gate)',
      residual2: '+ residual',
      outputH: 'Output h\'',
      formula: 'adaLN(h, y) = γ(y) ⊙ LN(h) + β(y)',
      insight: 'α initialized to 0 → each block starts as identity function',
      zeroInit: 'Init = 0',
      scaleShift: 'Scale & Shift',
    },
  }[locale]!;

  const [hoveredParam, setHoveredParam] = useState<number | null>(null);

  // Layout: Left panel (conditioning MLP) + Center panel (DiT block)
  const leftX = 30;
  const centerX = 310;
  const blockW = 260;

  // Param colors
  const paramColors = [COLORS.primary, COLORS.primary, COLORS.red, COLORS.green, COLORS.green, COLORS.red];
  const paramGroupLabels = [t.scaleShift, t.scaleShift, 'Gate', t.scaleShift, t.scaleShift, 'Gate'];

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>
        <defs>
          <marker id="adaln-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.mid} />
          </marker>
          <marker id="adaln-arrow-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill={COLORS.red} />
          </marker>
        </defs>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* === Left Panel: Conditioning === */}
        <text x={leftX + 100} y={55} textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark}>
          {t.condTitle}
        </text>

        {/* Timestep t */}
        <rect x={leftX} y={70} width={90} height={28} rx={14}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={leftX + 45} y={87} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.orange}>
          {t.timestep}
        </text>

        {/* Class c */}
        <rect x={leftX + 110} y={70} width={90} height={28} rx={14}
          fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
        <text x={leftX + 155} y={87} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.orange}>
          {t.classLabel}
        </text>

        {/* Merge arrows into MLP */}
        <line x1={leftX + 45} y1={98} x2={leftX + 100} y2={118}
          stroke={COLORS.mid} strokeWidth={1} />
        <line x1={leftX + 155} y1={98} x2={leftX + 100} y2={118}
          stroke={COLORS.mid} strokeWidth={1} />

        {/* MLP box */}
        <motion.rect x={leftX + 55} y={118} width={90} height={32} rx={6}
          fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={2}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />
        <text x={leftX + 100} y={137} textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.primary}>
          {t.mlp}
        </text>

        {/* Arrow down to 6 params */}
        <line x1={leftX + 100} y1={150} x2={leftX + 100} y2={165}
          stroke={COLORS.mid} strokeWidth={1.5} markerEnd="url(#adaln-arrow)" />
        <text x={leftX + 100} y={180} textAnchor="middle" fontSize="10" fontWeight="500" fill={COLORS.mid}>
          {t.sixParams}
        </text>

        {/* 6 parameter boxes */}
        {t.params.map((param, i) => {
          const px = leftX + 10 + i * 37;
          const py = 190;
          const isGate = i === 2 || i === 5;
          const isHovered = hoveredParam === i;
          return (
            <motion.g key={`param-${i}`}
              onMouseEnter={() => setHoveredParam(i)}
              onMouseLeave={() => setHoveredParam(null)}
              style={{ cursor: 'pointer' }}
            >
              <motion.rect x={px} y={py} width={32} height={28} rx={4}
                fill={isHovered ? paramColors[i] : isGate ? COLORS.waste : COLORS.valid}
                stroke={paramColors[i]} strokeWidth={isHovered ? 2 : 1.5}
                animate={{ scale: isHovered ? 1.1 : 1 }}
              />
              <text x={px + 16} y={py + 16} textAnchor="middle" fontSize="10" fontWeight="700"
                fill={isHovered ? COLORS.bg : paramColors[i]}>
                {param}
              </text>
              {/* Group label */}
              <text x={px + 16} y={py + 40} textAnchor="middle" fontSize="7" fill={COLORS.mid}>
                {paramGroupLabels[i]}
              </text>
              {/* Zero init label for gates */}
              {isGate && (
                <motion.text x={px + 16} y={py + 50} textAnchor="middle" fontSize="7"
                  fontWeight="600" fill={COLORS.red}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {t.zeroInit}
                </motion.text>
              )}
            </motion.g>
          );
        })}

        {/* Connection lines from params to DiT block */}
        {/* γ₁, β₁ → adaLN1; α₁ → gate1; γ₂, β₂ → adaLN2; α₂ → gate2 */}
        <motion.path
          d={`M${leftX + 26},${218} Q${leftX + 26},${270} ${centerX},${310}`}
          fill="none" stroke={COLORS.primary} strokeWidth={1} strokeDasharray="3 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />
        <motion.path
          d={`M${leftX + 63},${218} Q${leftX + 63},${265} ${centerX},${310}`}
          fill="none" stroke={COLORS.primary} strokeWidth={1} strokeDasharray="3 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
        <motion.path
          d={`M${leftX + 100},${218} Q${leftX + 130},${340} ${centerX},${365}`}
          fill="none" stroke={COLORS.red} strokeWidth={1} strokeDasharray="3 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        />
        <motion.path
          d={`M${leftX + 137},${218} Q${leftX + 137},${370} ${centerX},${400}`}
          fill="none" stroke={COLORS.green} strokeWidth={1} strokeDasharray="3 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        />
        <motion.path
          d={`M${leftX + 174},${218} Q${leftX + 174},${375} ${centerX},${400}`}
          fill="none" stroke={COLORS.green} strokeWidth={1} strokeDasharray="3 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        />
        <motion.path
          d={`M${leftX + 211},${218} Q${leftX + 240},${430} ${centerX},${445}`}
          fill="none" stroke={COLORS.red} strokeWidth={1} strokeDasharray="3 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        />

        {/* === Center Panel: DiT Block === */}
        {(() => {
          const bx = centerX;
          const by = 55;
          const bw = blockW;
          const bh = 430;

          // Internal element positions
          const elemX = bx + 30;
          const elemW = bw - 60;
          const elemH = 30;
          const startElemY = by + 40;
          const elemGap = 12;

          const elements = [
            { label: t.inputH, fill: COLORS.bgAlt, stroke: COLORS.mid, y: startElemY },
            { label: t.ln1, fill: COLORS.masked, stroke: COLORS.mid, y: startElemY + elemH + elemGap },
            { label: t.adaLN1 + ' ← γ₁, β₁', fill: COLORS.valid, stroke: COLORS.primary, y: startElemY + 2 * (elemH + elemGap) },
            { label: t.attn, fill: '#ede9fe', stroke: COLORS.purple, y: startElemY + 3 * (elemH + elemGap) },
            { label: t.gate1 + ' ← α₁', fill: COLORS.waste, stroke: COLORS.red, y: startElemY + 4 * (elemH + elemGap) },
            { label: t.residual1, fill: '#dcfce7', stroke: COLORS.green, y: startElemY + 5 * (elemH + elemGap) },
            { label: t.ln2, fill: COLORS.masked, stroke: COLORS.mid, y: startElemY + 6 * (elemH + elemGap) },
            { label: t.adaLN2 + ' ← γ₂, β₂', fill: COLORS.valid, stroke: COLORS.green, y: startElemY + 7 * (elemH + elemGap) },
            { label: t.ffn, fill: '#ede9fe', stroke: COLORS.purple, y: startElemY + 8 * (elemH + elemGap) },
            { label: t.gate2 + ' ← α₂', fill: COLORS.waste, stroke: COLORS.red, y: startElemY + 9 * (elemH + elemGap) },
            { label: t.residual2, fill: '#dcfce7', stroke: COLORS.green, y: startElemY + 10 * (elemH + elemGap) },
          ];

          return (
            <g>
              {/* Block border */}
              <rect x={bx} y={by} width={bw} height={bh} rx={8}
                fill={COLORS.bg} stroke={COLORS.dark} strokeWidth={1.5} strokeDasharray="6 3" />
              <text x={bx + bw / 2} y={by + 18} textAnchor="middle"
                fontSize="12" fontWeight="700" fill={COLORS.dark}>
                {t.blockTitle}
              </text>

              {/* Elements */}
              {elements.map((elem, i) => (
                <motion.g key={`elem-${i}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <rect x={elemX} y={elem.y} width={elemW} height={elemH} rx={4}
                    fill={elem.fill} stroke={elem.stroke} strokeWidth={1.5} />
                  <text x={elemX + elemW / 2} y={elem.y + elemH / 2 + 3} textAnchor="middle"
                    fontSize="9" fontWeight="600" fill={elem.stroke}>
                    {elem.label}
                  </text>
                  {/* Arrow to next element */}
                  {i < elements.length - 1 && (
                    <line x1={elemX + elemW / 2} y1={elem.y + elemH + 1}
                      x2={elemX + elemW / 2} y2={elements[i + 1].y - 1}
                      stroke={COLORS.mid} strokeWidth={0.8} markerEnd="url(#adaln-arrow)" />
                  )}
                </motion.g>
              ))}

              {/* Skip connection arcs (residual) */}
              {/* First residual: input → after gate1 */}
              <motion.path
                d={`M${elemX - 2},${elements[0].y + elemH / 2} C${elemX - 20},${elements[0].y + elemH / 2} ${elemX - 20},${elements[5].y + elemH / 2} ${elemX - 2},${elements[5].y + elemH / 2}`}
                fill="none" stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="4 2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
              {/* Second residual: after residual1 → after gate2 */}
              <motion.path
                d={`M${elemX - 2},${elements[5].y + elemH / 2} C${elemX - 20},${elements[5].y + elemH / 2} ${elemX - 20},${elements[10].y + elemH / 2} ${elemX - 2},${elements[10].y + elemH / 2}`}
                fill="none" stroke={COLORS.green} strokeWidth={1.5} strokeDasharray="4 2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              />

              {/* Output label */}
              <text x={bx + bw / 2} y={bh + by - 5} textAnchor="middle"
                fontSize="10" fontWeight="600" fill={COLORS.dark}>
                {t.outputH}
              </text>
            </g>
          );
        })()}

        {/* === Right Panel: Formula + Insight === */}
        {(() => {
          const rx = centerX + blockW + 25;
          const ry = 80;
          return (
            <g>
              {/* Formula box */}
              <rect x={rx} y={ry} width={210} height={45} rx={6}
                fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
              <text x={rx + 105} y={ry + 18} textAnchor="middle"
                fontSize="10" fontWeight="600" fill={COLORS.dark}>
                {t.formula}
              </text>
              <text x={rx + 105} y={ry + 34} textAnchor="middle"
                fontSize="9" fill={COLORS.mid}>
                h ← h + α(y) ⊙ Attn(adaLN(h, y))
              </text>

              {/* Key insight box */}
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <rect x={rx} y={ry + 60} width={210} height={60} rx={6}
                  fill={COLORS.waste} stroke={COLORS.red} strokeWidth={1.5} />
                <text x={rx + 105} y={ry + 78} textAnchor="middle"
                  fontSize="10" fontWeight="700" fill={COLORS.red}>
                  {locale === 'zh' ? '关键洞察' : 'Key Insight'}
                </text>
                <text x={rx + 105} y={ry + 95} textAnchor="middle"
                  fontSize="9" fill={COLORS.dark}>
                  {t.insight}
                </text>
                <text x={rx + 105} y={ry + 110} textAnchor="middle"
                  fontSize="8" fill={COLORS.mid}>
                  α₁ = α₂ = 0 → h' = h
                </text>
              </motion.g>

              {/* Conditioning methods comparison */}
              <g transform={`translate(${rx}, ${ry + 140})`}>
                <text x={105} y={12} textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.dark}>
                  {locale === 'zh' ? '条件注入方式对比' : 'Conditioning Methods'}
                </text>
                {[
                  { name: 'In-context', desc: locale === 'zh' ? '拼接到序列' : 'Concat to seq', perf: '△' },
                  { name: 'Cross-Attn', desc: locale === 'zh' ? '额外注意力层' : 'Extra attn layer', perf: '○' },
                  { name: 'adaLN', desc: locale === 'zh' ? '调制 LN 参数' : 'Modulate LN', perf: '○' },
                  { name: 'adaLN-Zero', desc: locale === 'zh' ? 'adaLN + 零初始化门' : 'adaLN + zero-init gate', perf: '★' },
                ].map((m, i) => (
                  <g key={m.name} transform={`translate(0, ${25 + i * 22})`}>
                    <rect x={0} y={0} width={210} height={18} rx={3}
                      fill={i === 3 ? COLORS.highlight : COLORS.bgAlt}
                      stroke={i === 3 ? COLORS.orange : COLORS.light} strokeWidth={1} />
                    <text x={8} y={12} fontSize="8" fontWeight={i === 3 ? '700' : '500'} fill={COLORS.dark}>
                      {m.name}
                    </text>
                    <text x={105} y={12} textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                      {m.desc}
                    </text>
                    <text x={195} y={12} textAnchor="middle" fontSize="9" fill={i === 3 ? COLORS.orange : COLORS.mid}>
                      {m.perf}
                    </text>
                  </g>
                ))}
              </g>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
