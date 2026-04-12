import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 780, SVG_H = 360;

function Box({ x, y, w, h, label, fill, stroke, fontSize = 9 }: {
  x: number; y: number; w: number; h: number;
  label: string; fill: string; stroke: string; fontSize?: number;
}) {
  const lines = label.split('\n');
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {lines.map((line, i) => (
        <text key={i} x={x + w / 2} y={y + h / 2 + (i - (lines.length - 1) / 2) * (fontSize + 2)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={fontSize} fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>
          {line}
        </text>
      ))}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color, dashed = false }: {
  x1: number; y1: number; x2: number; y2: number; color: string; dashed?: boolean;
}) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={1.5}
      strokeDasharray={dashed ? '5 3' : 'none'}
      markerEnd={`url(#arrowSBERT-${color.replace('#', '')})`}
    />
  );
}

export default function SiameseNetworkFlow({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      step1Title: '1. 输入两个句子',
      step2Title: '2. 共享 BERT 编码',
      step3Title: '3. Mean Pooling',
      step4Title: '4. 相似度计算',
      sentA: '句子 A',
      sentB: '句子 B',
      sharedBERT: 'Shared BERT\nEncoder',
      weightTied: '权重共享',
      tokenEmbA: 'Token Embeddings A\n(seq_len × 768)',
      tokenEmbB: 'Token Embeddings B\n(seq_len × 768)',
      poolA: 'Mean Pooling\n→ u (768,)',
      poolB: 'Mean Pooling\n→ v (768,)',
      cosineSim: 'Cosine\nSimilarity',
      loss: '训练目标: 正例对 sim→1, 负例对 sim→0',
      inputDesc: '两个待比较的句子分别输入网络',
      bertDesc: '两个句子通过同一个 BERT (权重共享) 编码为 token 级表示',
      poolDesc: '对所有 token 向量取均值，得到固定长度的句子向量',
      simDesc: '计算两个句子向量的余弦相似度，用对比损失训练',
      sentAExample: '"深度学习很有趣"',
      sentBExample: '"机器学习非常有意思"',
    },
    en: {
      step1Title: '1. Input Two Sentences',
      step2Title: '2. Shared BERT Encoding',
      step3Title: '3. Mean Pooling',
      step4Title: '4. Similarity Computation',
      sentA: 'Sentence A',
      sentB: 'Sentence B',
      sharedBERT: 'Shared BERT\nEncoder',
      weightTied: 'Weight Tied',
      tokenEmbA: 'Token Embeddings A\n(seq_len × 768)',
      tokenEmbB: 'Token Embeddings B\n(seq_len × 768)',
      poolA: 'Mean Pooling\n→ u (768,)',
      poolB: 'Mean Pooling\n→ v (768,)',
      cosineSim: 'Cosine\nSimilarity',
      loss: 'Objective: positive pairs sim→1, negative pairs sim→0',
      inputDesc: 'Two sentences to compare are fed into the network',
      bertDesc: 'Both sentences pass through the same BERT (weight-tied) to get token-level representations',
      poolDesc: 'Average all token vectors to get a fixed-length sentence embedding',
      simDesc: 'Compute cosine similarity between sentence vectors, train with contrastive loss',
      sentAExample: '"Deep learning is fun"',
      sentBExample: '"Machine learning is interesting"',
    },
  }[locale]!;

  const midX = W / 2;
  const leftX = 100, rightX = W - 240;
  const boxW = 160, boxH = 40;

  function getSteps() {
    return [
      {
        title: t.step1Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            <defs>
              <marker id="arrowSBERT-1565c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
              </marker>
            </defs>
            {/* Sentence A */}
            <Box x={leftX} y={80} w={boxW} h={50} label={`${t.sentA}\n${t.sentAExample}`} fill={COLORS.valid} stroke={COLORS.primary} />
            {/* Sentence B */}
            <Box x={rightX} y={80} w={boxW} h={50} label={`${t.sentB}\n${t.sentBExample}`} fill="#dcfce7" stroke={COLORS.green} />
            {/* Description */}
            <text x={midX} y={200} textAnchor="middle" fontSize="12" fill={COLORS.dark}>{t.inputDesc}</text>
            {/* Visual arrows pointing down */}
            <Arrow x1={leftX + boxW / 2} y1={132} x2={leftX + boxW / 2} y2={160} color={COLORS.primary} />
            <text x={leftX + boxW / 2} y={175} textAnchor="middle" fontSize="10" fill={COLORS.mid}>↓</text>
            <Arrow x1={rightX + boxW / 2} y1={132} x2={rightX + boxW / 2} y2={160} color={COLORS.primary} />
            <text x={rightX + boxW / 2} y={175} textAnchor="middle" fontSize="10" fill={COLORS.mid}>↓</text>
          </svg>
        ),
      },
      {
        title: t.step2Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            <defs>
              <marker id="arrowSBERT2-1565c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
              </marker>
            </defs>
            {/* Sentence inputs */}
            <Box x={leftX} y={30} w={boxW} h={35} label={t.sentA} fill={COLORS.valid} stroke={COLORS.primary} fontSize={8} />
            <Box x={rightX} y={30} w={boxW} h={35} label={t.sentB} fill="#dcfce7" stroke={COLORS.green} fontSize={8} />
            {/* Arrows down */}
            <line x1={leftX + boxW / 2} y1={67} x2={leftX + boxW / 2} y2={100} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowSBERT2-1565c0)" />
            <line x1={rightX + boxW / 2} y1={67} x2={rightX + boxW / 2} y2={100} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowSBERT2-1565c0)" />
            {/* Two BERT boxes */}
            <Box x={leftX - 10} y={102} w={boxW + 20} h={50} label={t.sharedBERT} fill={COLORS.highlight} stroke={COLORS.orange} />
            <Box x={rightX - 10} y={102} w={boxW + 20} h={50} label={t.sharedBERT} fill={COLORS.highlight} stroke={COLORS.orange} />
            {/* Dashed connection showing weight sharing */}
            <line x1={leftX + boxW + 12} y1={127} x2={rightX - 12} y2={127}
              stroke={COLORS.orange} strokeWidth={2} strokeDasharray="6 4" />
            <text x={midX} y={122} textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLORS.orange}>
              {t.weightTied}
            </text>
            {/* Output arrows */}
            <line x1={leftX + boxW / 2} y1={154} x2={leftX + boxW / 2} y2={185} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowSBERT2-1565c0)" />
            <line x1={rightX + boxW / 2} y1={154} x2={rightX + boxW / 2} y2={185} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowSBERT2-1565c0)" />
            {/* Token embeddings */}
            <Box x={leftX - 20} y={187} w={boxW + 40} h={40} label={t.tokenEmbA} fill={COLORS.bgAlt} stroke={COLORS.primary} fontSize={8} />
            <Box x={rightX - 20} y={187} w={boxW + 40} h={40} label={t.tokenEmbB} fill={COLORS.bgAlt} stroke={COLORS.primary} fontSize={8} />
            {/* Description */}
            <text x={midX} y={270} textAnchor="middle" fontSize="11" fill={COLORS.dark}>{t.bertDesc}</text>
          </svg>
        ),
      },
      {
        title: t.step3Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            <defs>
              <marker id="arrowSBERT3-1565c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
              </marker>
            </defs>
            {/* Token embeddings */}
            <Box x={leftX - 20} y={30} w={boxW + 40} h={40} label={t.tokenEmbA} fill={COLORS.bgAlt} stroke={COLORS.primary} fontSize={8} />
            <Box x={rightX - 20} y={30} w={boxW + 40} h={40} label={t.tokenEmbB} fill={COLORS.bgAlt} stroke={COLORS.primary} fontSize={8} />
            {/* Arrows */}
            <line x1={leftX + boxW / 2} y1={72} x2={leftX + boxW / 2} y2={110} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowSBERT3-1565c0)" />
            <line x1={rightX + boxW / 2} y1={72} x2={rightX + boxW / 2} y2={110} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowSBERT3-1565c0)" />
            {/* Mean pooling boxes */}
            <Box x={leftX - 10} y={112} w={boxW + 20} h={50} label={t.poolA} fill={COLORS.valid} stroke={COLORS.primary} />
            <Box x={rightX - 10} y={112} w={boxW + 20} h={50} label={t.poolB} fill={COLORS.valid} stroke={COLORS.primary} />
            {/* Visual: grid to single vector */}
            {[0, 1, 2, 3, 4].map(i => (
              <g key={`grid-${i}`}>
                <rect x={leftX + 20 + i * 24} y={205} width={20} height={12} rx={2}
                  fill={COLORS.primary} opacity={0.2 + i * 0.15} />
                <rect x={rightX + 20 + i * 24} y={205} width={20} height={12} rx={2}
                  fill={COLORS.green} opacity={0.2 + i * 0.15} />
              </g>
            ))}
            <text x={leftX + boxW / 2} y={240} textAnchor="middle" fontSize="9" fill={COLORS.primary} fontWeight="bold">
              u ∈ ℝ⁷⁶⁸
            </text>
            <text x={rightX + boxW / 2} y={240} textAnchor="middle" fontSize="9" fill={COLORS.green} fontWeight="bold">
              v ∈ ℝ⁷⁶⁸
            </text>
            {/* Description */}
            <text x={midX} y={290} textAnchor="middle" fontSize="11" fill={COLORS.dark}>{t.poolDesc}</text>
            {/* Formula */}
            <text x={midX} y={320} textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>
              u = mean(h₁, h₂, ..., hₙ)
            </text>
          </svg>
        ),
      },
      {
        title: t.step4Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            <defs>
              <marker id="arrowSBERT4-1565c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
              </marker>
              <marker id="arrowSBERT4-2e7d32" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.green} />
              </marker>
            </defs>
            {/* Sentence vectors */}
            <Box x={leftX} y={40} w={boxW} h={35} label="u (768,)" fill={COLORS.valid} stroke={COLORS.primary} fontSize={10} />
            <Box x={rightX} y={40} w={boxW} h={35} label="v (768,)" fill="#dcfce7" stroke={COLORS.green} fontSize={10} />
            {/* Arrows converging to similarity */}
            <line x1={leftX + boxW / 2} y1={77} x2={midX - 20} y2={130} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowSBERT4-1565c0)" />
            <line x1={rightX + boxW / 2} y1={77} x2={midX + 20} y2={130} stroke={COLORS.green} strokeWidth={1.5} markerEnd="url(#arrowSBERT4-2e7d32)" />
            {/* Cosine similarity box */}
            <Box x={midX - 70} y={132} w={140} h={50} label={t.cosineSim} fill={COLORS.highlight} stroke={COLORS.orange} fontSize={11} />
            {/* Score output */}
            <line x1={midX} y1={184} x2={midX} y2={215} stroke={COLORS.orange} strokeWidth={1.5} markerEnd="url(#arrowSBERT4-1565c0)" />
            <rect x={midX - 50} y={218} width={100} height={35} rx={8}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={2} />
            <text x={midX} y={240} textAnchor="middle" fontSize="13" fontWeight="bold" fill={COLORS.green}>
              sim = 0.92
            </text>
            {/* Loss description */}
            <rect x={midX - 240} y={280} width={480} height={35} rx={6}
              fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1} />
            <text x={midX} y={302} textAnchor="middle" fontSize="10" fill={COLORS.dark}>
              {t.loss}
            </text>
            {/* Description */}
            <text x={midX} y={345} textAnchor="middle" fontSize="11" fill={COLORS.mid}>{t.simDesc}</text>
          </svg>
        ),
      },
    ];
  }

  return (
    <div className="my-6">
      <StepNavigator steps={getSteps()} locale={locale} />
    </div>
  );
}
