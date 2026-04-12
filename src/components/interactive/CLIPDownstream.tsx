import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;

type AppType = 'text2img' | 'multimodal_llm' | 'retrieval';

function Box({ x, y, w, h, label, sublabel, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; sublabel?: string;
  fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + (sublabel ? h / 2 - 6 : h / 2 + 1)} textAnchor="middle"
        dominantBaseline="middle" fontSize="10" fontWeight="600" fill={stroke}
        fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + w / 2} y={y + h / 2 + 8} textAnchor="middle"
          dominantBaseline="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#cd-arrow)" />
  );
}

export default function CLIPDownstream({ locale = 'zh' }: Props) {
  const [activeApp, setActiveApp] = useState<AppType>('text2img');

  const t = {
    zh: {
      title: 'CLIP 下游应用',
      text2img: '文本生成图像',
      multimodal_llm: '多模态 LLM',
      retrieval: '跨模态检索',
      // text2img
      t2iInput: '文本输入',
      t2iPrompt: '"a cat on the moon"',
      t2iClipEnc: 'CLIP 文本编码器',
      t2iEmb: '文本嵌入',
      t2iDenoise: 'U-Net / DiT',
      t2iDecode: 'VAE 解码',
      t2iOutput: '生成图像',
      t2iNote: 'Stable Diffusion 使用 CLIP 文本编码器引导去噪过程',
      // multimodal_llm
      mllmInput: '图像输入',
      mllmClipVis: 'CLIP 视觉编码器',
      mllmTokens: 'Visual Tokens',
      mllmProj: '线性投影',
      mllmLLM: 'LLM (Vicuna)',
      mllmText: '文本输入',
      mllmOutput: '文本回答',
      mllmNote: 'LLaVA: 用 CLIP 视觉编码器将图像转为 visual tokens 输入 LLM',
      // retrieval
      retQuery: '查询',
      retClipEnc: 'CLIP 编码器',
      retVector: '查询向量',
      retANN: 'ANN 搜索',
      retDB: '向量数据库',
      retResults: '检索结果',
      retNote: '图文混合检索：文本或图像查询均可在同一向量空间中检索',
    },
    en: {
      title: 'CLIP Downstream Applications',
      text2img: 'Text-to-Image',
      multimodal_llm: 'Multimodal LLM',
      retrieval: 'Cross-Modal Retrieval',
      t2iInput: 'Text Input',
      t2iPrompt: '"a cat on the moon"',
      t2iClipEnc: 'CLIP Text Encoder',
      t2iEmb: 'Text Embedding',
      t2iDenoise: 'U-Net / DiT',
      t2iDecode: 'VAE Decode',
      t2iOutput: 'Generated Image',
      t2iNote: 'Stable Diffusion uses CLIP text encoder to guide the denoising process',
      mllmInput: 'Image Input',
      mllmClipVis: 'CLIP Vision Encoder',
      mllmTokens: 'Visual Tokens',
      mllmProj: 'Linear Projection',
      mllmLLM: 'LLM (Vicuna)',
      mllmText: 'Text Input',
      mllmOutput: 'Text Response',
      mllmNote: 'LLaVA: uses CLIP vision encoder to convert images into visual tokens for the LLM',
      retQuery: 'Query',
      retClipEnc: 'CLIP Encoder',
      retVector: 'Query Vector',
      retANN: 'ANN Search',
      retDB: 'Vector DB',
      retResults: 'Results',
      retNote: 'Cross-modal retrieval: both text and image queries search the same vector space',
    },
  }[locale]!;

  const tabs: { key: AppType; label: string }[] = [
    { key: 'text2img', label: t.text2img },
    { key: 'multimodal_llm', label: t.multimodal_llm },
    { key: 'retrieval', label: t.retrieval },
  ];

  const renderText2Img = () => (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="cd-arrow" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>
      <Box x={40} y={120} w={120} h={50} label={t.t2iInput} sublabel={t.t2iPrompt}
        fill={COLORS.highlight} stroke={COLORS.orange} />
      <Arrow x1={160} y1={145} x2={200} y2={145} />
      <Box x={200} y={120} w={130} h={50} label={t.t2iClipEnc} sublabel="frozen"
        fill="#e3f2fd" stroke={COLORS.primary} />
      <Arrow x1={330} y1={145} x2={370} y2={145} />
      <Box x={370} y={120} w={100} h={50} label={t.t2iEmb} sublabel="D=768"
        fill="#e8f5e9" stroke={COLORS.green} />
      <Arrow x1={470} y1={145} x2={510} y2={145} />
      <Box x={510} y={120} w={110} h={50} label={t.t2iDenoise} sublabel="cross-attention"
        fill="#f3e5f5" stroke={COLORS.purple} />
      <Arrow x1={620} y1={145} x2={660} y2={145} />
      <Box x={660} y={120} w={100} h={50} label={t.t2iOutput}
        fill={COLORS.bgAlt} stroke={COLORS.dark} />

      {/* Noise input */}
      <Box x={530} y={40} w={80} h={35} label="Noise" sublabel="z ~ N(0,1)"
        fill={COLORS.waste} stroke={COLORS.red} />
      <Arrow x1={565} y1={75} x2={565} y2={120} />

      <text x={400} y={230} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.purple} fontFamily={FONTS.sans}>Stable Diffusion / DALL-E</text>
      <rect x={100} y={260} width={600} height={30} rx={6}
        fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
      <text x={400} y={279} textAnchor="middle" fontSize="10" fill={COLORS.orange}
        fontFamily={FONTS.sans}>{t.t2iNote}</text>
    </svg>
  );

  const renderMultimodalLLM = () => (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="cd-arrow2" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>
      {/* Image path */}
      <Box x={40} y={60} w={100} h={50} label={t.mllmInput} sublabel="🖼️"
        fill={COLORS.valid} stroke={COLORS.primary} />
      <Arrow x1={140} y1={85} x2={180} y2={85} />
      <Box x={180} y={60} w={140} h={50} label={t.mllmClipVis} sublabel="ViT-L/14 (frozen)"
        fill="#e3f2fd" stroke={COLORS.primary} />
      <Arrow x1={320} y1={85} x2={360} y2={85} />
      <Box x={360} y={60} w={100} h={50} label={t.mllmTokens} sublabel="576 tokens"
        fill="#e8f5e9" stroke={COLORS.green} />
      <Arrow x1={460} y1={85} x2={500} y2={85} />
      <Box x={500} y={60} w={90} h={50} label={t.mllmProj} sublabel="W_proj"
        fill="#fff3e0" stroke={COLORS.orange} />

      {/* Text path */}
      <Box x={40} y={200} w={100} h={50} label={t.mllmText} sublabel='"Describe this"'
        fill={COLORS.highlight} stroke={COLORS.orange} />
      <Arrow x1={140} y1={225} x2={500} y2={225} />

      {/* Merge into LLM */}
      <line x1={545} y1={110} x2={545} y2={200} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" />
      <Arrow x1={545} y1={200} x2={600} y2={170} />
      <Arrow x1={500} y1={225} x2={600} y2={170} />
      <Box x={600} y={130} w={100} h={80} label={t.mllmLLM} sublabel="7B params"
        fill="#f3e5f5" stroke={COLORS.purple} />
      <Arrow x1={700} y1={170} x2={740} y2={170} />
      <text x={760} y={165} fontSize="11" fontWeight="600" fill={COLORS.dark}
        fontFamily={FONTS.sans}>{t.mllmOutput}</text>
      <text x={760} y={180} fontSize="8" fill={COLORS.mid}
        fontFamily={FONTS.sans}>"This is a cat sitting..."</text>

      <text x={400} y={310} textAnchor="middle" fontSize="10" fontWeight="600"
        fill={COLORS.purple} fontFamily={FONTS.sans}>LLaVA (Liu et al., 2023)</text>
      <rect x={100} y={330} width={600} height={30} rx={6}
        fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
      <text x={400} y={349} textAnchor="middle" fontSize="10" fill={COLORS.orange}
        fontFamily={FONTS.sans}>{t.mllmNote}</text>
    </svg>
  );

  const renderRetrieval = () => (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <marker id="cd-arrow3" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>
      <Box x={40} y={130} w={100} h={50} label={t.retQuery} sublabel="text / image"
        fill={COLORS.highlight} stroke={COLORS.orange} />
      <Arrow x1={140} y1={155} x2={190} y2={155} />
      <Box x={190} y={130} w={120} h={50} label={t.retClipEnc}
        fill="#e3f2fd" stroke={COLORS.primary} />
      <Arrow x1={310} y1={155} x2={360} y2={155} />
      <Box x={360} y={130} w={100} h={50} label={t.retVector} sublabel="D=768"
        fill="#e8f5e9" stroke={COLORS.green} />
      <Arrow x1={460} y1={155} x2={510} y2={155} />
      <Box x={510} y={130} w={100} h={50} label={t.retANN} sublabel="FAISS / Milvus"
        fill="#f3e5f5" stroke={COLORS.purple} />
      <Arrow x1={610} y1={155} x2={660} y2={155} />
      <Box x={660} y={130} w={100} h={50} label={t.retResults} sublabel="top-K"
        fill={COLORS.bgAlt} stroke={COLORS.dark} />

      {/* Vector DB below */}
      <Box x={510} y={230} w={100} h={40} label={t.retDB} sublabel="pre-encoded"
        fill={COLORS.valid} stroke={COLORS.primary} />
      <line x1={560} y1={180} x2={560} y2={230} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" />

      <rect x={100} y={310} width={600} height={30} rx={6}
        fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth={1} />
      <text x={400} y={329} textAnchor="middle" fontSize="10" fill={COLORS.orange}
        fontFamily={FONTS.sans}>{t.retNote}</text>
    </svg>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-semibold mr-3" style={{ color: COLORS.dark }}>{t.title}</span>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveApp(tab.key)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeApp === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeApp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeApp === 'text2img' && renderText2Img()}
            {activeApp === 'multimodal_llm' && renderMultimodalLLM()}
            {activeApp === 'retrieval' && renderRetrieval()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
