// src/components/interactive/PrefillDecodeOverview.tsx

import { COLORS } from './shared/colors';

export default function PrefillDecodeOverview() {
  return (
    <div className="my-6 w-full overflow-x-auto">
      <svg viewBox="0 0 860 580" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '2rem auto' }}>
        {/* Background */}
        <rect width="860" height="580" fill="#fafafa" rx="8" />

        {/* Title */}
        <text x="430" y="32" textAnchor="middle" fontSize="17" fontWeight="bold" fill={COLORS.dark}>Prefill vs Decode 阶段对比</text>

        {/* Arrow marker */}
        <defs>
          <marker id="arrowPD" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.mid} />
          </marker>
        </defs>

        {/* === Prefill Section === */}
        <rect x="20" y="50" width="400" height="510" rx="10" fill="#e8f5e9" stroke="#4caf50" strokeWidth="1.5" />
        <text x="220" y="78" textAnchor="middle" fontSize="16" fontWeight="bold" fill={COLORS.green}>Prefill 阶段</text>
        <text x="220" y="96" textAnchor="middle" fontSize="11" fill="#555">处理完整 Prompt（并行）</text>

        {/* Input tokens - multiple */}
        <text x="220" y="125" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#444">输入: n 个 token 同时处理</text>
        <rect x="40" y="135" width="55" height="26" rx="5" fill="#bbdefb" stroke={COLORS.primary} strokeWidth="1" />
        <text x="67" y="153" textAnchor="middle" fontSize="9" fill={COLORS.primary}>token₁</text>
        <rect x="105" y="135" width="55" height="26" rx="5" fill="#bbdefb" stroke={COLORS.primary} strokeWidth="1" />
        <text x="132" y="153" textAnchor="middle" fontSize="9" fill={COLORS.primary}>token₂</text>
        <rect x="170" y="135" width="55" height="26" rx="5" fill="#bbdefb" stroke={COLORS.primary} strokeWidth="1" />
        <text x="197" y="153" textAnchor="middle" fontSize="9" fill={COLORS.primary}>token₃</text>
        <text x="245" y="153" textAnchor="middle" fontSize="12" fill={COLORS.mid}>...</text>
        <rect x="265" y="135" width="55" height="26" rx="5" fill="#bbdefb" stroke={COLORS.primary} strokeWidth="1" />
        <text x="292" y="153" textAnchor="middle" fontSize="9" fill={COLORS.primary}>tokenₙ</text>

        {/* Arrow down */}
        <line x1="220" y1="165" x2="220" y2="190" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#arrowPD)" />

        {/* GEMM operation */}
        <rect x="70" y="195" width="300" height="40" rx="6" fill="#c8e6c9" stroke="#388e3c" strokeWidth="1.2" />
        <text x="220" y="212" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1b5e20">矩阵 x 矩阵 (GEMM)</text>
        <text x="220" y="227" textAnchor="middle" fontSize="10" fill={COLORS.green}>(n x d) x (d x d) = n x d</text>

        {/* Arrow down */}
        <line x1="220" y1="240" x2="220" y2="265" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#arrowPD)" />

        {/* Full attention */}
        <rect x="70" y="270" width="300" height="35" rx="6" fill="#c8e6c9" stroke="#388e3c" strokeWidth="1.2" />
        <text x="220" y="292" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1b5e20">Full Self-Attention (n x n)</text>

        {/* Arrow down */}
        <line x1="220" y1="310" x2="220" y2="335" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#arrowPD)" />

        {/* KV Cache generation */}
        <rect x="70" y="340" width="300" height="35" rx="6" fill="#fff9c4" stroke="#f9a825" strokeWidth="1.2" />
        <text x="220" y="362" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.orange}>生成完整 KV Cache</text>

        {/* Arrow down */}
        <line x1="220" y1="380" x2="220" y2="405" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#arrowPD)" />

        {/* Output */}
        <rect x="140" y="410" width="160" height="30" rx="5" fill="#e1bee7" stroke="#7b1fa2" strokeWidth="1.2" />
        <text x="220" y="430" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.purple}>输出: 第一个 token</text>

        {/* Prefill characteristics */}
        <rect x="40" y="455" width="360" height="90" rx="6" fill="#fff" stroke="#c8e6c9" strokeWidth="1" />
        <text x="220" y="475" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.green}>Compute-bound</text>
        <text x="220" y="493" textAnchor="middle" fontSize="10" fill="#555">AI = 2n / sizeof(dtype) (FP16 下约 1024)</text>
        <text x="220" y="509" textAnchor="middle" fontSize="10" fill="#555">GPU 算力是瓶颈，利用率高</text>
        <text x="220" y="525" textAnchor="middle" fontSize="10" fill="#555">决定 TTFT (Time To First Token)</text>

        {/* === Decode Section === */}
        <rect x="440" y="50" width="400" height="510" rx="10" fill="#fce4ec" stroke="#e57373" strokeWidth="1.5" />
        <text x="640" y="78" textAnchor="middle" fontSize="16" fontWeight="bold" fill={COLORS.red}>Decode 阶段</text>
        <text x="640" y="96" textAnchor="middle" fontSize="11" fill="#555">自回归生成（逐 token）</text>

        {/* Input token - single */}
        <text x="640" y="125" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#444">输入: 1 个 token</text>
        <rect x="600" y="135" width="80" height="26" rx="5" fill="#ffcdd2" stroke={COLORS.red} strokeWidth="1" />
        <text x="640" y="153" textAnchor="middle" fontSize="9" fill={COLORS.red}>new token</text>

        {/* Arrow down */}
        <line x1="640" y1="165" x2="640" y2="190" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#arrowPD)" />

        {/* GEMV operation */}
        <rect x="490" y="195" width="300" height="40" rx="6" fill="#ffcdd2" stroke={COLORS.red} strokeWidth="1.2" />
        <text x="640" y="212" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#b71c1c">向量 x 矩阵 (GEMV)</text>
        <text x="640" y="227" textAnchor="middle" fontSize="10" fill={COLORS.red}>(1 x d) x (d x d) = 1 x d</text>

        {/* Arrow down */}
        <line x1="640" y1="240" x2="640" y2="265" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#arrowPD)" />

        {/* KV Cache attention */}
        <rect x="490" y="270" width="300" height="35" rx="6" fill="#ffcdd2" stroke={COLORS.red} strokeWidth="1.2" />
        <text x="640" y="292" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#b71c1c">Query x KV Cache (1 x S)</text>

        {/* Arrow down */}
        <line x1="640" y1="310" x2="640" y2="335" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#arrowPD)" />

        {/* KV Cache update */}
        <rect x="490" y="340" width="300" height="35" rx="6" fill="#fff9c4" stroke="#f9a825" strokeWidth="1.2" />
        <text x="640" y="362" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.orange}>追加到 KV Cache (S → S+1)</text>

        {/* Arrow down */}
        <line x1="640" y1="380" x2="640" y2="405" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#arrowPD)" />

        {/* Output */}
        <rect x="560" y="410" width="160" height="30" rx="5" fill="#e1bee7" stroke="#7b1fa2" strokeWidth="1.2" />
        <text x="640" y="430" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.purple}>输出: 下一个 token</text>

        {/* Loop arrow */}
        <path d="M 720 425 Q 780 425 780 300 Q 780 170 700 170 L 685 170" fill="none" stroke="#999" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#arrowPD)" />
        <text x="800" y="300" textAnchor="middle" fontSize="9" fill="#999" transform="rotate(90, 800, 300)">重复直到结束</text>

        {/* Decode characteristics */}
        <rect x="460" y="455" width="360" height="90" rx="6" fill="#fff" stroke="#ffcdd2" strokeWidth="1" />
        <text x="640" y="475" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLORS.red}>Memory-bound</text>
        <text x="640" y="493" textAnchor="middle" fontSize="10" fill="#555">AI = 2 / sizeof(dtype) (FP16 下仅 1)</text>
        <text x="640" y="509" textAnchor="middle" fontSize="10" fill="#555">内存带宽是瓶颈，GPU 算力闲置</text>
        <text x="640" y="525" textAnchor="middle" fontSize="10" fill="#555">决定 TPS (Tokens Per Second)</text>
      </svg>
    </div>
  );
}
