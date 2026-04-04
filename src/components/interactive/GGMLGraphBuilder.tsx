import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

// Reusable node box
function Node({ x, y, label, shape, color = COLORS.orange }: {
  x: number; y: number; label: string; shape?: string; color?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={110} height={28} rx={5}
        fill={color === COLORS.orange ? '#fef3c7' : '#dbeafe'}
        stroke={color} strokeWidth={1.2} />
      <text x={x + 55} y={y + 13} textAnchor="middle" fontSize="7.5"
        fontWeight="600" fill={color} fontFamily={FONTS.sans}>{label}</text>
      {shape && (
        <text x={x + 55} y={y + 23} textAnchor="middle" fontSize="6"
          fill={COLORS.mid} fontFamily={FONTS.mono}>{shape}</text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke="#94a3b8" strokeWidth={1} markerEnd="url(#gg-arr)" />;
}

const steps = [
  {
    title: 'Step 1: 输入 Tensor',
    content: (
      <StepSvg h={120}>
        <defs>
          <marker id="gg-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <Node x={235} y={20} label="input_embed" shape="(seq, 4096)" />
        <text x={W / 2} y={80} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          ggml_new_tensor_2d(ctx, GGML_TYPE_F32, 4096, seq_len)
        </text>
        <text x={W / 2} y={100} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          空图 + 输入嵌入, 尚未添加任何操作
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: RMSNorm + QKV Projection',
    content: (
      <StepSvg h={200}>
        <defs>
          <marker id="gg-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <Node x={235} y={10} label="input_embed" shape="(seq, 4096)" />
        <Arrow x1={290} y1={38} x2={290} y2={50} />
        <Node x={235} y={50} label="RMSNorm" shape="(seq, 4096)" />
        <Arrow x1={250} y1={78} x2={120} y2={100} />
        <Arrow x1={290} y1={78} x2={290} y2={100} />
        <Arrow x1={330} y1={78} x2={440} y2={100} />
        <Node x={50} y={100} label="Q = Linear" shape="(seq, 4096)" />
        <Node x={235} y={100} label="K = Linear" shape="(seq, 512)" />
        <Node x={400} y={100} label="V = Linear" shape="(seq, 512)" />
        <text x={W / 2} y={160} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          RMSNorm: ggml_rms_norm(x) | Linear: ggml_mul_mat(weight, x)
        </text>
        <text x={W / 2} y={175} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          GQA: Q 有 32 heads, K/V 只有 8 heads (Qwen3-8B)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: RoPE + Attention + O Proj',
    content: (
      <StepSvg h={220}>
        <defs>
          <marker id="gg-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <Node x={50} y={10} label="Q" shape="(seq, 4096)" />
        <Node x={235} y={10} label="K" shape="(seq, 512)" />
        <Node x={400} y={10} label="V" shape="(seq, 512)" />
        <Arrow x1={105} y1={38} x2={105} y2={55} />
        <Arrow x1={290} y1={38} x2={290} y2={55} />
        <Node x={50} y={55} label="RoPE(Q)" shape="旋转位置编码" />
        <Node x={235} y={55} label="RoPE(K)" shape="旋转位置编码" />
        <Arrow x1={105} y1={83} x2={230} y2={105} />
        <Arrow x1={290} y1={83} x2={260} y2={105} />
        <Arrow x1={455} y1={38} x2={310} y2={105} />
        <Node x={190} y={105} label="FlashAttention" shape="fused QKV → output" />
        <Arrow x1={245} y1={133} x2={245} y2={150} />
        <Node x={190} y={150} label="O Projection" shape="(seq, 4096)" />
        <text x={W / 2} y={205} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          FlashAttention 融合了 QK^T/√d → softmax → ×V 三步为单内核
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 4: Residual + FFN (SwiGLU)',
    content: (
      <StepSvg h={240}>
        <defs>
          <marker id="gg-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <Node x={50} y={10} label="input_embed" shape="残差连接" color={COLORS.primary} />
        <Node x={300} y={10} label="Attn Output" shape="(seq, 4096)" />
        <Arrow x1={160} y1={24} x2={225} y2={40} />
        <Arrow x1={355} y1={38} x2={290} y2={40} />
        <Node x={190} y={42} label="Add (残差)" shape="(seq, 4096)" color={COLORS.primary} />
        <Arrow x1={245} y1={70} x2={245} y2={85} />
        <Node x={190} y={85} label="RMSNorm" shape="(seq, 4096)" />
        <Arrow x1={200} y1={113} x2={120} y2={130} />
        <Arrow x1={290} y1={113} x2={350} y2={130} />
        <Node x={50} y={130} label="Gate = Linear" shape="(seq, 11008)" />
        <Node x={290} y={130} label="Up = Linear" shape="(seq, 11008)" />
        <Arrow x1={105} y1={158} x2={200} y2={175} />
        <Arrow x1={345} y1={158} x2={260} y2={175} />
        <Node x={170} y={175} label="SiLU(Gate) × Up" shape="SwiGLU 激活" />
        <Arrow x1={225} y1={203} x2={225} y2={215} />
        <Node x={170} y={215} label="Down = Linear" shape="→ (seq, 4096) + 残差" />
      </StepSvg>
    ),
  },
];

export default function GGMLGraphBuilder() {
  return <StepNavigator steps={steps} />;
}
