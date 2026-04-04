import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function Box({ x, y, w, h, label, fill, stroke }: {
  x: number; y: number; w: number; h: number;
  label: string; fill: string; stroke: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontWeight="600" fill={stroke} fontFamily={FONTS.sans}>{label}</text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, id }: {
  x1: number; y1: number; x2: number; y2: number; id: string;
}) {
  return (
    <g>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="10" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#94a3b8" strokeWidth={1.5} markerEnd={`url(#${id})`} />
    </g>
  );
}

const steps = [
  {
    title: 'Self-Attention',
    content: (
      <StepSvg h={220}>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Self-Attention: Q, K, V 来自同一序列
        </text>

        <Box x={200} y={35} w={180} h={35} label="Input Sequence X"
          fill="#dbeafe" stroke={COLORS.primary} />

        {[
          { label: 'Q = Wq·X', cx: 120, color: COLORS.primary },
          { label: 'K = Wk·X', cx: 290, color: COLORS.green },
          { label: 'V = Wv·X', cx: 460, color: COLORS.orange },
        ].map((item, i) => (
          <g key={i}>
            <Arrow x1={290} y1={70} x2={item.cx} y2={95} id={`csa-s-${i}`} />
            <Box x={item.cx - 65} y={95} w={130} h={30}
              label={item.label} fill="#f8fafc" stroke={item.color} />
          </g>
        ))}

        <Arrow x1={290} y1={125} x2={290} y2={150} id="csa-s-att" />
        <Box x={200} y={150} w={180} h={35} label="Attention(Q, K, V)"
          fill="#fef3c7" stroke={COLORS.orange} />

        <text x={W / 2} y={210} textAnchor="middle" fontSize="9" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          所有 Q, K, V 都从相同的输入 X 投影得到
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Cross-Attention',
    content: (
      <StepSvg h={240}>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Cross-Attention: Q 来自 Decoder，K/V 来自 Encoder
        </text>

        <Box x={30} y={40} w={160} h={35} label="Decoder Hidden (Y)"
          fill="#dbeafe" stroke={COLORS.primary} />
        <Box x={390} y={40} w={160} h={35} label="Encoder Output (X)"
          fill="#dcfce7" stroke={COLORS.green} />

        <Arrow x1={110} y1={75} x2={150} y2={105} id="csa-c-q" />
        <Box x={85} y={105} w={130} h={30} label="Q = Wq·Y"
          fill="#f8fafc" stroke={COLORS.primary} />

        <Arrow x1={470} y1={75} x2={350} y2={105} id="csa-c-k" />
        <Box x={285} y={105} w={130} h={30} label="K = Wk·X"
          fill="#f8fafc" stroke={COLORS.green} />
        <Arrow x1={470} y1={75} x2={490} y2={105} id="csa-c-v" />
        <Box x={425} y={105} w={130} h={30} label="V = Wv·X"
          fill="#f8fafc" stroke={COLORS.green} />

        <Arrow x1={290} y1={135} x2={290} y2={160} id="csa-c-att" />
        <Box x={200} y={160} w={180} h={35} label="Attention(Q, K, V)"
          fill="#fef3c7" stroke={COLORS.orange} />

        <text x={W / 2} y={220} textAnchor="middle" fontSize="9" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Q 来自 decoder 自身，K/V 来自外部 encoder — 用于翻译、多模态等跨序列场景
        </text>
      </StepSvg>
    ),
  },
];

export default function CrossVsSelfAttention() {
  return <StepNavigator steps={steps} />;
}
