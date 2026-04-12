import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';
import StepNavigator from '../primitives/StepNavigator';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 500;

export default function BERTNLUPipeline({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      steps: [
        { title: '输入与分词', desc: '原始文本被 tokenize，加上 [CLS] 和 [SEP] 特殊标记' },
        { title: 'BERT 双向编码', desc: '每个 token 通过双向 self-attention 获取全局上下文信息' },
        { title: 'Intent 分类头', desc: '[CLS] 向量 → Linear → Softmax → 意图类别' },
        { title: 'Slot 标注头', desc: '每个 token 向量 → Linear → BIO 标签序列' },
        { title: '联合结果与损失', desc: '意图分类 + 槽位填充联合训练，共享 BERT 编码器' },
      ],
      input: '帮我订一张从北京到上海的明天的机票',
      intent: 'BookFlight',
      lossTitle: '联合损失',
    },
    en: {
      steps: [
        { title: 'Input & Tokenization', desc: 'Raw text is tokenized with [CLS] and [SEP] special tokens' },
        { title: 'BERT Bidirectional Encoding', desc: 'Each token attends to all others via bidirectional self-attention' },
        { title: 'Intent Classification Head', desc: '[CLS] vector → Linear → Softmax → intent class' },
        { title: 'Slot Tagging Head', desc: 'Each token vector → Linear → BIO tag sequence' },
        { title: 'Joint Result & Loss', desc: 'Intent + slot filling jointly trained, sharing BERT encoder' },
      ],
      input: 'Book a flight from Beijing to Shanghai tomorrow',
      intent: 'BookFlight',
      lossTitle: 'Joint Loss',
    },
  }[locale]!;

  const [step, setStep] = useState(0);

  // Tokens for the pipeline
  const tokensZh = ['[CLS]', '帮', '我', '订', '从', '北京', '到', '上海', '明天', '的', '机票', '[SEP]'];
  const tokensEn = ['[CLS]', 'Book', 'a', 'flight', 'from', 'Beijing', 'to', 'Shanghai', 'tomorrow', '[SEP]'];
  const tokens = locale === 'zh' ? tokensZh : tokensEn;

  // BIO tags
  const bioZh = ['', 'O', 'O', 'O', 'O', 'B-depart', 'O', 'B-arrive', 'B-date', 'O', 'O', ''];
  const bioEn = ['', 'O', 'O', 'O', 'O', 'B-depart', 'O', 'B-arrive', 'B-date', ''];
  const bioTags = locale === 'zh' ? bioZh : bioEn;

  // Slot colors
  const slotColorMap: Record<string, string> = {
    'B-depart': COLORS.primary,
    'B-arrive': COLORS.purple,
    'B-date': COLORS.orange,
    'O': COLORS.mid,
  };

  const n = tokens.length;
  const tokenW = Math.min(60, (W - 80) / n);
  const tokenStartX = (W - n * tokenW) / 2;
  const tokenRowY = 100;
  const encoderY = 200;
  const headY = 320;

  const getTokenX = (i: number) => tokenStartX + i * tokenW + tokenW / 2;

  return (
    <div className="my-6">
      <StepNavigator
        steps={t.steps.map(s => ({ title: s.title, description: s.desc }))}
        currentStep={step}
        onStepChange={setStep}
        locale={locale}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Step 1+: Token row */}
        {step >= 0 && tokens.map((tok, i) => {
          let bgColor: string = COLORS.valid;
          if (tok === '[CLS]') bgColor = COLORS.highlight;
          else if (tok === '[SEP]') bgColor = COLORS.masked;

          // In step 4+, highlight slot tokens
          if (step >= 3 && bioTags[i] && bioTags[i] !== 'O' && bioTags[i] !== '') {
            bgColor = '#dbeafe';
          }

          return (
            <motion.g key={`tok-${i}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}>
              <rect x={getTokenX(i) - tokenW / 2 + 2} y={tokenRowY} width={tokenW - 4} height={30} rx={4}
                fill={bgColor} stroke={COLORS.primary} strokeWidth={tok === '[CLS]' || tok === '[SEP]' ? 2 : 1} />
              <text x={getTokenX(i)} y={tokenRowY + 19} textAnchor="middle" fontSize={tokenW > 50 ? 10 : 8} fill={COLORS.dark}>
                {tok}
              </text>
            </motion.g>
          );
        })}

        {/* Step 2+: BERT encoder block */}
        {step >= 1 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <rect x={tokenStartX - 10} y={encoderY - 20} width={n * tokenW + 20} height={60} rx={8}
              fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={2} strokeDasharray="6 3" />
            <text x={W / 2} y={encoderY + 8} textAnchor="middle" fontSize="13" fontWeight="bold" fill={COLORS.primary}>
              BERT Encoder (Bidirectional)
            </text>

            {/* Arrows from tokens to encoder */}
            {tokens.map((_, i) => (
              <line key={`arr-enc-${i}`} x1={getTokenX(i)} y1={tokenRowY + 32} x2={getTokenX(i)} y2={encoderY - 22}
                stroke={COLORS.primary} strokeWidth={1} markerEnd="url(#arrowBlue)" opacity={0.5} />
            ))}

            {/* Bidirectional attention arrows */}
            {step >= 1 && (
              <>
                {[1, 2, 3].map(offset => (
                  tokens.slice(0, -offset).map((_, i) => (
                    <motion.path
                      key={`bidi-${i}-${offset}`}
                      d={`M ${getTokenX(i)} ${encoderY - 25} Q ${(getTokenX(i) + getTokenX(i + offset)) / 2} ${encoderY - 35 - offset * 8} ${getTokenX(i + offset)} ${encoderY - 25}`}
                      fill="none" stroke={COLORS.primary} strokeWidth={0.8} opacity={0.2}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.02 }}
                    />
                  ))
                ))}
              </>
            )}
          </motion.g>
        )}

        {/* Step 3: Intent head from [CLS] */}
        {step >= 2 && (
          <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Arrow from [CLS] */}
            <line x1={getTokenX(0)} y1={encoderY + 42} x2={120} y2={headY}
              stroke={COLORS.green} strokeWidth={2} markerEnd="url(#arrowGreen)" />

            {/* Intent head */}
            <rect x={40} y={headY} width={160} height={36} rx={6}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={2} />
            <text x={120} y={headY + 15} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
              Linear → Softmax
            </text>
            <text x={120} y={headY + 29} textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.green}>
              {t.intent}
            </text>

            {/* [CLS] label */}
            <text x={getTokenX(0)} y={encoderY + 55} textAnchor="middle" fontSize="9" fill={COLORS.green}>
              [CLS]
            </text>
          </motion.g>
        )}

        {/* Step 4: Slot tags */}
        {step >= 3 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {tokens.map((tok, i) => {
              const tag = bioTags[i];
              if (!tag || tag === '') return null;
              const color = slotColorMap[tag] || COLORS.mid;
              return (
                <motion.g key={`slot-${i}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <line x1={getTokenX(i)} y1={encoderY + 42} x2={getTokenX(i)} y2={headY + 5}
                    stroke={color} strokeWidth={1.5} opacity={0.6} />
                  <rect x={getTokenX(i) - tokenW / 2 + 4} y={headY} width={tokenW - 8} height={24} rx={4}
                    fill={tag === 'O' ? COLORS.masked : '#ede9fe'} stroke={color} strokeWidth={tag === 'O' ? 1 : 2} />
                  <text x={getTokenX(i)} y={headY + 15} textAnchor="middle" fontSize={8} fontWeight="bold" fill={color}>
                    {tag}
                  </text>
                </motion.g>
              );
            })}

            {/* Slot head label */}
            <text x={W / 2} y={headY + 40} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
              Slot Tagging Head (per-token BIO)
            </text>
          </motion.g>
        )}

        {/* Step 5: Joint result */}
        {step >= 4 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Summary box */}
            <rect x={40} y={headY + 55} width={W - 80} height={80} rx={8}
              fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth={1.5} />

            {/* Intent result */}
            <text x={60} y={headY + 75} fontSize="11" fontWeight="bold" fill={COLORS.green}>
              Intent: {t.intent}
            </text>

            {/* Slot results */}
            <text x={60} y={headY + 95} fontSize="10" fill={COLORS.dark}>
              Slots:
              <tspan fill={COLORS.primary}> depart=</tspan>
              <tspan fontWeight="bold">Beijing</tspan>
              <tspan fill={COLORS.purple}> arrive=</tspan>
              <tspan fontWeight="bold">Shanghai</tspan>
              <tspan fill={COLORS.orange}> date=</tspan>
              <tspan fontWeight="bold">{locale === 'zh' ? '明天' : 'tomorrow'}</tspan>
            </text>

            {/* Loss formula */}
            <text x={60} y={headY + 120} fontSize="10" fill={COLORS.mid}>
              {t.lossTitle}:
            </text>
            <text x={160} y={headY + 120} fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>
              {'L = \u03B1 \u00B7 L_intent + (1-\u03B1) \u00B7 L_slot'}
            </text>
          </motion.g>
        )}

        {/* Arrow markers */}
        <defs>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
