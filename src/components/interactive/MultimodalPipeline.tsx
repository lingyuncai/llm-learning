import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 200;

export default function MultimodalPipeline() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        多模态推理数据流
      </text>

      <defs>
        <marker id="mm-arr" viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Image path (top) */}
      <rect x={20} y={40} width={80} height={35} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={60} y={55} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>图像输入</text>
      <text x={60} y={67} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Ollama 预处理</text>

      <line x1={100} y1={57} x2={125} y2={57}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={125} y={40} width={100} height={35} rx={5}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={175} y={55} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Vision Encoder</text>
      <text x={175} y={67} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>GGML 执行</text>

      <line x1={225} y1={57} x2={250} y2={57}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={250} y={40} width={80} height={35} rx={5}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={290} y={55} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Image</text>
      <text x={290} y={67} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Embedding</text>

      {/* Text path (bottom) */}
      <rect x={20} y={100} width={80} height={35} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={60} y={115} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>文本输入</text>
      <text x={60} y={127} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Tokenize</text>

      <line x1={100} y1={117} x2={250} y2={117}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={250} y={100} width={80} height={35} rx={5}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={290} y={115} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>Text</text>
      <text x={290} y={127} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Embedding</text>

      {/* Merge */}
      <line x1={290} y1={75} x2={370} y2={90}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />
      <line x1={330} y1={117} x2={370} y2={100}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={370} y={80} width={80} height={35} rx={5}
        fill="#f0e6ff" stroke="#7c3aed" strokeWidth={1.2} />
      <text x={410} y={95} textAnchor="middle" fontSize="7" fontWeight="600"
        fill="#7c3aed" fontFamily={FONTS.sans}>合并序列</text>
      <text x={410} y={107} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>[img] + [text]</text>

      {/* Decoder */}
      <line x1={450} y1={97} x2={475} y2={97}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />

      <rect x={475} y={80} width={80} height={35} rx={5}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
      <text x={515} y={95} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.orange} fontFamily={FONTS.sans}>Transformer</text>
      <text x={515} y={107} textAnchor="middle" fontSize="6" fill={COLORS.mid}
        fontFamily={FONTS.sans}>GGML Decoder</text>

      {/* Output */}
      <line x1={515} y1={115} x2={515} y2={140}
        stroke="#94a3b8" strokeWidth={1} markerEnd="url(#mm-arr)" />
      <rect x={475} y={140} width={80} height={25} rx={12}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={1.2} />
      <text x={515} y={156} textAnchor="middle" fontSize="7" fontWeight="600"
        fill={COLORS.primary} fontFamily={FONTS.sans}>输出文本</text>

      {/* Legend */}
      <rect x={30} y={H - 20} width={10} height={10} rx={2}
        fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
      <text x={44} y={H - 12} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
        Ollama (Go)
      </text>
      <rect x={150} y={H - 20} width={10} height={10} rx={2}
        fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.8} />
      <text x={164} y={H - 12} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
        GGML (C/C++)
      </text>
      <rect x={270} y={H - 20} width={10} height={10} rx={2}
        fill="#f0e6ff" stroke="#7c3aed" strokeWidth={0.8} />
      <text x={284} y={H - 12} fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>
        合并层
      </text>
    </svg>
  );
}
