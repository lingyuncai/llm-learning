import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 260;

export default function DualEngineSelector() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Runner 选择逻辑: ollamarunner vs llamarunner
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
        fill={COLORS.dark} fontFamily={FONTS.sans}>GGUF Model</text>

      {/* Arrow down */}
      <line x1={290} y1={63} x2={290} y2={85}
        stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#des-arr)" />

      {/* Decision diamond */}
      <polygon points="290,85 370,115 290,145 210,115"
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={290} y={112} textAnchor="middle" fontSize="7.5" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>model.New</text>
      <text x={290} y={122} textAnchor="middle" fontSize="7.5" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>TextProcessor?</text>

      {/* Left branch: success → ollamarunner */}
      <line x1={210} y1={115} x2={120} y2={115}
        stroke={COLORS.primary} strokeWidth={1.2} markerEnd="url(#des-arr)" />
      <text x={165} y={108} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.green} fontFamily={FONTS.sans}>成功</text>

      <rect x={30} y={100} width={90} height={50} rx={6}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.5} />
      <text x={75} y={118} textAnchor="middle" fontSize="8" fontWeight="700"
        fill={COLORS.primary} fontFamily={FONTS.sans}>ollamarunner</text>
      <text x={75} y={130} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>纯 Go, ~21 架构</text>
      <text x={75} y={140} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>Pipeline async</text>

      {/* Right branch: fail → llamarunner */}
      <line x1={370} y1={115} x2={460} y2={115}
        stroke={COLORS.orange} strokeWidth={1.2} markerEnd="url(#des-arr)" />
      <text x={415} y={108} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.red} fontFamily={FONTS.sans}>失败</text>

      <rect x={460} y={100} width={90} height={50} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.5} />
      <text x={505} y={118} textAnchor="middle" fontSize="8" fontWeight="700"
        fill={COLORS.orange} fontFamily={FONTS.sans}>llamarunner</text>
      <text x={505} y={130} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>llama.cpp CGo, ~120+</text>
      <text x={505} y={140} textAnchor="middle" fontSize="6.5"
        fill={COLORS.mid} fontFamily={FONTS.sans}>Sync 执行</text>

      {/* Both → GGML */}
      <line x1={75} y1={150} x2={240} y2={200}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#des-arr)" />
      <line x1={505} y1={150} x2={340} y2={200}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#des-arr)" />

      <rect x={210} y={200} width={160} height={28} rx={6}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={290} y={218} textAnchor="middle" fontSize="9" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>GGML Backend (共享)</text>

      {/* Legend */}
      <rect x={30} y={H - 22} width={10} height={10} rx={2}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1} />
      <text x={44} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        Ollama (Go) — 新方向, 更快
      </text>
      <rect x={250} y={H - 22} width={10} height={10} rx={2}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1} />
      <text x={264} y={H - 13} fontSize="7" fill={COLORS.dark} fontFamily={FONTS.sans}>
        llama.cpp (C/C++) — 兼容性后备
      </text>
    </svg>
  );
}
