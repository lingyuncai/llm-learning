import { COLORS, FONTS } from './shared/colors';

type Locale = 'zh' | 'en';

const W = 580;
const H = 280;

export default function DualRunnerComparison({ locale = 'zh' }: { locale?: Locale }) {
  const t = {
    zh: {
      title: 'ollamarunner vs llamarunner',
      ollamarunnerLabel: 'ollamarunner (Go)',
      goGraphBuild: 'Go 图构建: model.Forward()',
      pipelineAsync: 'Pipeline Async 执行',
      architectures21: '~21 架构 (llama, qwen3, ...)',
      newDirection: '新方向: 性能优化, 减少 CGo 开销',
      llamarunnerLabel: 'llamarunner (C++/CGo)',
      cApi: 'C API: llama_decode()',
      syncExec: '同步执行',
      architectures120: '~120+ 架构 (全面兼容)',
      compatFallback: '兼容性后备: 不支持的架构走此路径',
      ggmlBackend: 'GGML Backend (共享)',
      convergeNote: '两个 runner 最终都提交计算图给同一个 GGML 后端执行',
    },
    en: {
      title: 'ollamarunner vs llamarunner',
      ollamarunnerLabel: 'ollamarunner (Go)',
      goGraphBuild: 'Go graph build: model.Forward()',
      pipelineAsync: 'Pipeline Async execution',
      architectures21: '~21 architectures (llama, qwen3, ...)',
      newDirection: 'New direction: perf optimization, reduce CGo overhead',
      llamarunnerLabel: 'llamarunner (C++/CGo)',
      cApi: 'C API: llama_decode()',
      syncExec: 'Sync execution',
      architectures120: '~120+ architectures (full compatibility)',
      compatFallback: 'Compatibility fallback: unsupported archs use this path',
      ggmlBackend: 'GGML Backend (shared)',
      convergeNote: 'Both runners submit compute graph to same GGML backend',
    },
  }[locale];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      <defs>
        <marker id="drc-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Left: ollamarunner (blue) */}
      <rect x={30} y={35} width={220} height={160} rx={8}
        fill="none" stroke={COLORS.primary} strokeWidth={1.5} strokeDasharray="6,3" />
      <text x={140} y={52} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>{t.ollamarunnerLabel}</text>

      <rect x={55} y={62} width={170} height={25} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={140} y={78} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>{t.goGraphBuild}</text>

      <rect x={55} y={95} width={170} height={25} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={140} y={111} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>{t.pipelineAsync}</text>

      <rect x={55} y={128} width={170} height={25} rx={4}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={140} y={144} textAnchor="middle" fontSize="7.5" fill={COLORS.primary}
        fontFamily={FONTS.sans}>{t.architectures21}</text>

      <text x={140} y={172} textAnchor="middle" fontSize="7" fill={COLORS.green}
        fontFamily={FONTS.sans}>{t.newDirection}</text>

      {/* Right: llamarunner (orange) */}
      <rect x={330} y={35} width={220} height={160} rx={8}
        fill="none" stroke={COLORS.orange} strokeWidth={1.5} strokeDasharray="6,3" />
      <text x={440} y={52} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.llamarunnerLabel}</text>

      <rect x={355} y={62} width={170} height={25} rx={4}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={440} y={78} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
        fontFamily={FONTS.sans}>{t.cApi}</text>

      <rect x={355} y={95} width={170} height={25} rx={4}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={440} y={111} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
        fontFamily={FONTS.sans}>{t.syncExec}</text>

      <rect x={355} y={128} width={170} height={25} rx={4}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={440} y={144} textAnchor="middle" fontSize="7.5" fill={COLORS.orange}
        fontFamily={FONTS.sans}>{t.architectures120}</text>

      <text x={440} y={172} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>{t.compatFallback}</text>

      {/* Both converge to GGML */}
      <line x1={140} y1={195} x2={250} y2={225}
        stroke={COLORS.primary} strokeWidth={1.2} markerEnd="url(#drc-arr)" />
      <line x1={440} y1={195} x2={330} y2={225}
        stroke={COLORS.orange} strokeWidth={1.2} markerEnd="url(#drc-arr)" />

      <rect x={200} y={225} width={180} height={30} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={290} y={244} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>{t.ggmlBackend}</text>

      <text x={290} y={270} textAnchor="middle" fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>
        {t.convergeNote}
      </text>
    </svg>
  );
}
