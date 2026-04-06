import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 260;

export default function DualEngineSelector({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Runner 选择逻辑: ollamarunner vs llamarunner',
      ggufModel: 'GGUF Model',
      textProcessorCheck: 'model.New\nTextProcessor?',
      success: '成功',
      fail: '失败',
      ollamarunner: 'ollamarunner',
      ollamaDesc1: '纯 Go, ~21 架构',
      ollamaDesc2: 'Pipeline async',
      llamarunner: 'llamarunner',
      llamaDesc1: 'llama.cpp CGo, ~120+',
      llamaDesc2: 'Sync 执行',
      ggmlBackend: 'GGML Backend (共享)',
      ollamaLegend: 'Ollama (Go) — 新方向, 更快',
      llamaLegend: 'llama.cpp (C/C++) — 兼容性后备',
    },
    en: {
      title: 'Runner Selection Logic: ollamarunner vs llamarunner',
      ggufModel: 'GGUF Model',
      textProcessorCheck: 'model.New\nTextProcessor?',
      success: 'Success',
      fail: 'Fail',
      ollamarunner: 'ollamarunner',
      ollamaDesc1: 'Pure Go, ~21 archs',
      ollamaDesc2: 'Pipeline async',
      llamarunner: 'llamarunner',
      llamaDesc1: 'llama.cpp CGo, ~120+',
      llamaDesc2: 'Sync execution',
      ggmlBackend: 'GGML Backend (shared)',
      ollamaLegend: 'Ollama (Go) — New direction, faster',
      llamaLegend: 'llama.cpp (C/C++) — Compatibility fallback',
    },
  }[locale];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      <defs>
        <marker id="des-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Input: model */}
      <rect x={220} y={35} width={140} height={28} rx={14}
        fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.2} />
      <text x={290} y={53} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.ggufModel}</text>

      {/* Arrow down */}
      <line x1={290} y1={63} x2={290} y2={85}
        stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#des-arr)" />

      {/* Decision diamond */}
      <polygon points="290,85 370,115 290,145 210,115"
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={290} y={117} textAnchor="middle" fontSize="7.5" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.textProcessorCheck}</text>

      {/* Left branch: success → ollamarunner */}
      <line x1={210} y1={115} x2={120} y2={115}
        stroke={COLORS.primary} strokeWidth={1.2} markerEnd="url(#des-arr)" />
      <text x={165} y={108} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>{t.success}</text>

      <rect x={30} y={100} width={90} height={50} rx={6}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={75} y={118} textAnchor="middle" fontSize="8" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.ollamarunner}</text>
      <text x={75} y={130} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{t.ollamaDesc1}</text>
      <text x={75} y={140} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{t.ollamaDesc2}</text>

      {/* Right branch: fail → llamarunner */}
      <line x1={370} y1={115} x2={460} y2={115}
        stroke={COLORS.orange} strokeWidth={1.2} markerEnd="url(#des-arr)" />
      <text x={415} y={108} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>{t.fail}</text>

      <rect x={460} y={100} width={90} height={50} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={505} y={118} textAnchor="middle" fontSize="8" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.llamarunner}</text>
      <text x={505} y={130} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{t.llamaDesc1}</text>
      <text x={505} y={140} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{t.llamaDesc2}</text>

      {/* Both → GGML */}
      <line x1={75} y1={150} x2={240} y2={200}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#des-arr)" />
      <line x1={505} y1={150} x2={340} y2={200}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#des-arr)" />

      <rect x={210} y={200} width={160} height={28} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={290} y={218} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.ggmlBackend}</text>

      {/* Legend */}
      <rect x={30} y={H - 22} width={10} height={10} rx={2}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={44} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.ollamaLegend}
      </text>
      <rect x={250} y={H - 22} width={10} height={10} rx={2}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={264} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.llamaLegend}
      </text>
    </svg>
  );
}
