import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 780, SVG_H = 350;

function Box({ x, y, w, h, label, fill, stroke, fontSize = 9 }: {
  x: number; y: number; w: number; h: number;
  label: string; fill: string; stroke: string; fontSize?: number;
}) {
  const lines = label.split('\n');
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {lines.map((line, i) => (
        <text key={i} x={x + w / 2} y={y + h / 2 + (i - (lines.length - 1) / 2) * (fontSize + 3)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={fontSize} fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>
          {line}
        </text>
      ))}
    </g>
  );
}

export default function RAGPipelineFlow({ locale = 'zh' }: Props) {
  const t = {
    zh: {
      step1Title: '1. 查询编码',
      step2Title: '2. 向量检索',
      step3Title: '3. 上下文提取',
      step4Title: '4. Prompt 构建',
      step5Title: '5. LLM 生成',
      userQuery: '用户问题',
      queryExample: '"Transformer 的\n注意力机制是什么？"',
      embModel: 'Embedding\nModel',
      queryVec: 'Query Vector\nq ∈ ℝ⁷⁶⁸',
      vectorDB: 'Vector DB',
      annSearch: 'ANN Search\n(近似最近邻)',
      top3: 'Top-3 结果',
      doc1: 'Doc 1: Attention 机制\n通过 Q/K/V 计算...',
      doc2: 'Doc 2: Self-Attention\n允许序列内部交互...',
      doc3: 'Doc 3: Multi-Head\n多个注意力头并行...',
      promptTemplate: 'Prompt Template',
      context: '检索上下文',
      question: '用户问题',
      instruction: '基于以下内容回答问题:',
      llm: 'LLM\n(GPT/Claude)',
      answer: '回答 (基于检索内容)',
      answerText: 'Transformer 的注意力机制通过\nQuery, Key, Value 三个矩阵计算\n加权注意力分数...',
      grounded: '有据可查的回答',
      desc1: '将用户问题编码为向量表示',
      desc2: '在向量数据库中搜索最相似的文档片段',
      desc3: '获取最相关的文档作为上下文',
      desc4: '将检索内容和问题组装为 Prompt',
      desc5: 'LLM 基于提供的上下文生成回答',
      sim: '相似度',
    },
    en: {
      step1Title: '1. Query Encoding',
      step2Title: '2. Vector Retrieval',
      step3Title: '3. Context Extraction',
      step4Title: '4. Prompt Construction',
      step5Title: '5. LLM Generation',
      userQuery: 'User Query',
      queryExample: '"What is the attention\nmechanism in Transformers?"',
      embModel: 'Embedding\nModel',
      queryVec: 'Query Vector\nq ∈ ℝ⁷⁶⁸',
      vectorDB: 'Vector DB',
      annSearch: 'ANN Search\n(Approx Nearest Neighbor)',
      top3: 'Top-3 Results',
      doc1: 'Doc 1: Attention computes\nweighted sums via Q/K/V...',
      doc2: 'Doc 2: Self-Attention\nallows intra-sequence...',
      doc3: 'Doc 3: Multi-Head runs\nparallel attention heads...',
      promptTemplate: 'Prompt Template',
      context: 'Retrieved Context',
      question: 'User Question',
      instruction: 'Answer based on the context:',
      llm: 'LLM\n(GPT/Claude)',
      answer: 'Answer (grounded in context)',
      answerText: 'The attention mechanism in Transformers\ncomputes weighted scores using Query,\nKey, and Value matrices...',
      grounded: 'Grounded answer',
      desc1: 'Encode the user query into a vector representation',
      desc2: 'Search the vector database for most similar document chunks',
      desc3: 'Retrieve the most relevant documents as context',
      desc4: 'Assemble retrieved content and question into a prompt',
      desc5: 'LLM generates an answer grounded in the provided context',
      sim: 'Similarity',
    },
  }[locale]!;

  const midX = W / 2;

  function getSteps() {
    return [
      {
        title: t.step1Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            <defs>
              <marker id="arrowRAG1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
              </marker>
            </defs>
            {/* User query */}
            <Box x={80} y={60} w={180} h={55} label={`${t.userQuery}\n${t.queryExample}`} fill={COLORS.valid} stroke={COLORS.primary} fontSize={8} />
            {/* Arrow */}
            <line x1={262} y1={87} x2={330} y2={87} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowRAG1)" />
            {/* Embedding model */}
            <Box x={335} y={60} w={140} h={55} label={t.embModel} fill={COLORS.highlight} stroke={COLORS.orange} fontSize={10} />
            {/* Arrow */}
            <line x1={477} y1={87} x2={530} y2={87} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowRAG1)" />
            {/* Query vector */}
            <Box x={535} y={60} w={160} h={55} label={t.queryVec} fill="#dcfce7" stroke={COLORS.green} fontSize={10} />
            {/* Description */}
            <text x={midX} y={180} textAnchor="middle" fontSize="12" fill={COLORS.dark}>{t.desc1}</text>
            {/* Visual: vector bars */}
            <g transform="translate(555, 140)">
              {[0.8, 0.3, 0.9, 0.5, 0.7, 0.2, 0.6, 0.4].map((v, i) => (
                <rect key={i} x={i * 17} y={20 - v * 18} width={12} height={v * 18} rx={2}
                  fill={COLORS.green} opacity={0.5 + v * 0.4} />
              ))}
            </g>
          </svg>
        ),
      },
      {
        title: t.step2Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            <defs>
              <marker id="arrowRAG2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.primary} />
              </marker>
            </defs>
            {/* Query vector */}
            <Box x={80} y={50} w={140} h={45} label={t.queryVec} fill="#dcfce7" stroke={COLORS.green} fontSize={9} />
            {/* Arrow */}
            <line x1={222} y1={72} x2={280} y2={72} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowRAG2)" />
            {/* Vector DB */}
            <rect x={285} y={30} width={200} height={100} rx={8}
              fill={COLORS.bgAlt} stroke={COLORS.purple} strokeWidth={2} />
            <text x={385} y={52} textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.purple}>{t.vectorDB}</text>
            {/* DB points */}
            {[[320, 70], [340, 90], [360, 75], [380, 95], [400, 80], [420, 100], [440, 72], [350, 108], [410, 65]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={4} fill={COLORS.purple} opacity={0.3 + (i % 3) * 0.2} />
            ))}
            {/* Highlighted top-3 */}
            <circle cx={360} cy={75} r={6} fill={COLORS.green} stroke={COLORS.green} strokeWidth={2} />
            <circle cx={380} cy={95} r={6} fill={COLORS.green} stroke={COLORS.green} strokeWidth={2} />
            <circle cx={340} cy={90} r={6} fill={COLORS.green} stroke={COLORS.green} strokeWidth={2} />
            {/* ANN search label */}
            <Box x={300} y={145} w={170} h={35} label={t.annSearch} fill={COLORS.highlight} stroke={COLORS.orange} fontSize={8} />
            {/* Arrow to results */}
            <line x1={487} y1={80} x2={530} y2={80} stroke={COLORS.primary} strokeWidth={1.5} markerEnd="url(#arrowRAG2)" />
            {/* Top-3 label */}
            <text x={600} y={55} textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLORS.green}>{t.top3}</text>
            {/* Similarity scores */}
            {[0.95, 0.89, 0.82].map((s, i) => (
              <g key={i}>
                <rect x={535} y={62 + i * 28} width={130} height={22} rx={4}
                  fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
                <text x={545} y={77 + i * 28} fontSize="8" fill={COLORS.dark}>Doc {i + 1}</text>
                <text x={655} y={77 + i * 28} textAnchor="end" fontSize="8" fontWeight="bold" fill={COLORS.green}>
                  {t.sim}: {s.toFixed(2)}
                </text>
              </g>
            ))}
            {/* Description */}
            <text x={midX} y={220} textAnchor="middle" fontSize="12" fill={COLORS.dark}>{t.desc2}</text>
          </svg>
        ),
      },
      {
        title: t.step3Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            {/* Three document cards */}
            {[
              { label: t.doc1, color: COLORS.primary, y: 40 },
              { label: t.doc2, color: COLORS.green, y: 130 },
              { label: t.doc3, color: COLORS.purple, y: 220 },
            ].map((doc, i) => (
              <g key={i}>
                <rect x={120} y={doc.y} width={540} height={70} rx={8}
                  fill={COLORS.bgAlt} stroke={doc.color} strokeWidth={1.5} />
                <rect x={120} y={doc.y} width={6} height={70} rx={3} fill={doc.color} />
                {doc.label.split('\n').map((line, li) => (
                  <text key={li} x={140} y={doc.y + 28 + li * 18} fontSize="10" fill={COLORS.dark}>
                    {line}
                  </text>
                ))}
                <text x={640} y={doc.y + 40} fontSize="9" fontWeight="bold" fill={doc.color}>
                  #{i + 1}
                </text>
              </g>
            ))}
            {/* Description */}
            <text x={midX} y={320} textAnchor="middle" fontSize="12" fill={COLORS.dark}>{t.desc3}</text>
          </svg>
        ),
      },
      {
        title: t.step4Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            {/* Prompt template */}
            <rect x={120} y={30} width={540} height={240} rx={8}
              fill={COLORS.bgAlt} stroke={COLORS.dark} strokeWidth={1.5} />
            <text x={140} y={55} fontSize="11" fontWeight="bold" fill={COLORS.dark}>{t.promptTemplate}</text>
            {/* Instruction */}
            <rect x={140} y={65} width={500} height={28} rx={4}
              fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
            <text x={155} y={83} fontSize="9" fill={COLORS.orange} fontFamily={FONTS.mono}>{t.instruction}</text>
            {/* Context section */}
            <text x={140} y={112} fontSize="9" fontWeight="bold" fill={COLORS.green}>[{t.context}]</text>
            <rect x={140} y={118} width={500} height={65} rx={4}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={1} opacity={0.7} />
            {[t.doc1.split('\n')[0], t.doc2.split('\n')[0], t.doc3.split('\n')[0]].map((line, i) => (
              <text key={i} x={155} y={136 + i * 18} fontSize="8" fill={COLORS.dark} fontFamily={FONTS.mono}>
                {line}
              </text>
            ))}
            {/* Question section */}
            <text x={140} y={202} fontSize="9" fontWeight="bold" fill={COLORS.primary}>[{t.question}]</text>
            <rect x={140} y={208} width={500} height={28} rx={4}
              fill={COLORS.valid} stroke={COLORS.primary} strokeWidth={1} />
            <text x={155} y={226} fontSize="9" fill={COLORS.dark} fontFamily={FONTS.mono}>
              {t.queryExample.replace(/\n/g, ' ').replace(/"/g, '')}
            </text>
            {/* Description */}
            <text x={midX} y={305} textAnchor="middle" fontSize="12" fill={COLORS.dark}>{t.desc4}</text>
          </svg>
        ),
      },
      {
        title: t.step5Title,
        content: (
          <svg viewBox={`0 0 ${W} ${SVG_H}`} className="w-full" role="img">
            <style>{`text { font-family: ${FONTS.sans}; }`}</style>
            <defs>
              <marker id="arrowRAG5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.purple} />
              </marker>
            </defs>
            {/* Assembled prompt */}
            <Box x={100} y={50} w={200} h={50} label={`${t.promptTemplate}\n(${t.context} + ${t.question})`} fill={COLORS.bgAlt} stroke={COLORS.dark} fontSize={8} />
            {/* Arrow */}
            <line x1={302} y1={75} x2={350} y2={75} stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#arrowRAG5)" />
            {/* LLM */}
            <Box x={355} y={40} w={120} h={70} label={t.llm} fill="#f3e8ff" stroke={COLORS.purple} fontSize={12} />
            {/* Arrow */}
            <line x1={477} y1={75} x2={520} y2={75} stroke={COLORS.purple} strokeWidth={1.5} markerEnd="url(#arrowRAG5)" />
            {/* Answer */}
            <rect x={100} y={150} width={580} height={100} rx={8}
              fill="#dcfce7" stroke={COLORS.green} strokeWidth={2} />
            <text x={120} y={173} fontSize="10" fontWeight="bold" fill={COLORS.green}>{t.answer}</text>
            {t.answerText.split('\n').map((line, i) => (
              <text key={i} x={120} y={195 + i * 16} fontSize="9" fill={COLORS.dark}>
                {line}
              </text>
            ))}
            {/* Grounded badge */}
            <rect x={525} y={45} width={140} height={60} rx={8}
              fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1.5} />
            <text x={595} y={72} textAnchor="middle" fontSize="9" fill={COLORS.orange}>
              ✓ {t.grounded}
            </text>
            {/* Description */}
            <text x={midX} y={290} textAnchor="middle" fontSize="12" fill={COLORS.dark}>{t.desc5}</text>
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
