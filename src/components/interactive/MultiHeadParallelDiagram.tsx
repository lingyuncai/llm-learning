// src/components/interactive/MultiHeadParallelDiagram.tsx
import { COLORS } from './shared/colors';

export default function MultiHeadParallelDiagram({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: 'Multi-Head Attention 计算结构',
      input: '输入 X: (B, S, H)',
      parallelCompute: 'h 个 Head 并行计算',
      eachHeadInner: '每个 Head 内部:',
      concat: 'Concat → reshape: (B, S, H)',
      output: '输出: (B, S, H)',
    },
    en: {
      title: 'Multi-Head Attention Computation Structure',
      input: 'Input X: (B, S, H)',
      parallelCompute: 'h Heads parallel computation',
      eachHeadInner: 'Each Head inner:',
      concat: 'Concat → reshape: (B, S, H)',
      output: 'Output: (B, S, H)',
    },
  }[locale];

  return (
    <div className="my-6 w-full overflow-x-auto">
      <svg viewBox="0 0 800 620" className="w-full max-w-3xl mx-auto" style={{ height: 'auto' }}>
        <rect width="800" height="620" fill="#fafafa" rx="8" />
        <text x="400" y="35" textAnchor="middle" fontSize="18" fontWeight="bold" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Input */}
        <rect x="300" y="55" width="200" height="36" rx="6" fill="#e8eaf6" stroke="#3f51b5" strokeWidth="1.5" />
        <text x="400" y="78" textAnchor="middle" fontSize="13" fill={COLORS.dark}>{t.input}</text>

        <defs>
          <marker id="mhpa-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#666" />
          </marker>
        </defs>

        <line x1="340" y1="91" x2="140" y2="130" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="400" y1="91" x2="400" y2="130" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="460" y1="91" x2="660" y2="130" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        <rect x="60" y="130" width="160" height="32" rx="6" fill="#fff3e0" stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="140" y="151" textAnchor="middle" fontSize="12" fill={COLORS.dark}>Linear W_Q: (H, H)</text>

        <rect x="320" y="130" width="160" height="32" rx="6" fill="#fff3e0" stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="400" y="151" textAnchor="middle" fontSize="12" fill={COLORS.dark}>Linear W_K: (H, H)</text>

        <rect x="580" y="130" width="160" height="32" rx="6" fill="#fff3e0" stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="660" y="151" textAnchor="middle" fontSize="12" fill={COLORS.dark}>Linear W_V: (H, H)</text>

        <line x1="140" y1="162" x2="140" y2="195" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="400" y1="162" x2="400" y2="195" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="660" y1="162" x2="660" y2="195" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        <rect x="40" y="195" width="200" height="32" rx="6" fill="#e0f2f1" stroke="#00695c" strokeWidth="1.5" />
        <text x="140" y="216" textAnchor="middle" fontSize="9" fill={COLORS.dark}>reshape + transpose → (B,h,S,d_k)</text>

        <rect x="300" y="195" width="200" height="32" rx="6" fill="#e0f2f1" stroke="#00695c" strokeWidth="1.5" />
        <text x="400" y="216" textAnchor="middle" fontSize="9" fill={COLORS.dark}>reshape + transpose → (B,h,S,d_k)</text>

        <rect x="560" y="195" width="200" height="32" rx="6" fill="#e0f2f1" stroke="#00695c" strokeWidth="1.5" />
        <text x="660" y="216" textAnchor="middle" fontSize="9" fill={COLORS.dark}>reshape + transpose → (B,h,S,d_k)</text>

        <line x1="140" y1="227" x2="140" y2="260" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="400" y1="227" x2="400" y2="260" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="660" y1="227" x2="660" y2="260" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        <rect x="30" y="255" width="740" height="200" rx="10" fill="none" stroke="#9e9e9e" strokeWidth="1" strokeDasharray="6,3" />
        <text x="55" y="275" fontSize="12" fill="#666" fontStyle="italic">{t.parallelCompute}</text>

        <rect x="55" y="290" width="150" height="80" rx="8" fill="#e3f2fd" stroke={COLORS.primary} strokeWidth="1.5" />
        <text x="130" y="315" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.primary}>Head 1</text>
        <text x="130" y="335" textAnchor="middle" fontSize="10" fill="#333">Attention(Q₁,K₁,V₁)</text>
        <text x="130" y="355" textAnchor="middle" fontSize="10" fill="#666">(B, 1, S, d_k)</text>

        <rect x="225" y="290" width="150" height="80" rx="8" fill="#e3f2fd" stroke={COLORS.primary} strokeWidth="1.5" />
        <text x="300" y="315" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.primary}>Head 2</text>
        <text x="300" y="335" textAnchor="middle" fontSize="10" fill="#333">Attention(Q₂,K₂,V₂)</text>
        <text x="300" y="355" textAnchor="middle" fontSize="10" fill="#666">(B, 1, S, d_k)</text>

        <text x="425" y="335" textAnchor="middle" fontSize="20" fill="#666">...</text>

        <rect x="475" y="290" width="150" height="80" rx="8" fill="#e3f2fd" stroke={COLORS.primary} strokeWidth="1.5" />
        <text x="550" y="315" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLORS.primary}>Head h</text>
        <text x="550" y="335" textAnchor="middle" fontSize="10" fill="#333">Attention(Q_h,K_h,V_h)</text>
        <text x="550" y="355" textAnchor="middle" fontSize="10" fill="#666">(B, 1, S, d_k)</text>

        <rect x="645" y="285" width="115" height="90" rx="6" fill="#fff8e1" stroke="#f9a825" strokeWidth="1" />
        <text x="702" y="305" textAnchor="middle" fontSize="9" fill="#333" fontWeight="bold">{t.eachHeadInner}</text>
        <text x="702" y="322" textAnchor="middle" fontSize="9" fill="#555">1. QK^T / √d_k</text>
        <text x="702" y="337" textAnchor="middle" fontSize="9" fill="#555">2. + Mask</text>
        <text x="702" y="352" textAnchor="middle" fontSize="9" fill="#555">3. Softmax</text>
        <text x="702" y="367" textAnchor="middle" fontSize="9" fill="#555">4. × V</text>

        <line x1="130" y1="370" x2="130" y2="400" stroke="#666" strokeWidth="1.2" />
        <line x1="300" y1="370" x2="300" y2="400" stroke="#666" strokeWidth="1.2" />
        <line x1="550" y1="370" x2="550" y2="400" stroke="#666" strokeWidth="1.2" />

        <line x1="130" y1="400" x2="370" y2="475" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="300" y1="400" x2="380" y2="475" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />
        <line x1="550" y1="400" x2="420" y2="475" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        <rect x="290" y="475" width="220" height="36" rx="6" fill="#f3e5f5" stroke="#7b1fa2" strokeWidth="1.5" />
        <text x="400" y="498" textAnchor="middle" fontSize="11" fill={COLORS.dark}>{t.concat}</text>

        <line x1="400" y1="511" x2="400" y2="540" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        <rect x="290" y="540" width="220" height="32" rx="6" fill="#fff3e0" stroke={COLORS.orange} strokeWidth="1.5" />
        <text x="400" y="561" textAnchor="middle" fontSize="12" fill={COLORS.dark}>Linear W_O: (H, H)</text>

        <line x1="400" y1="572" x2="400" y2="595" stroke="#666" strokeWidth="1.2" markerEnd="url(#mhpa-arrow)" />

        <rect x="300" y="575" width="200" height="36" rx="6" fill="#e8f5e9" stroke={COLORS.green} strokeWidth="1.5" />
        <text x="400" y="598" textAnchor="middle" fontSize="13" fill={COLORS.dark}>{t.output}</text>
      </svg>
    </div>
  );
}
