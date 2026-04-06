import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const SH = 280;

function StepSvg({ children }: { children: React.ReactNode }) {
  return <svg viewBox={`0 0 ${W} ${SH}`} className="w-full">{children}</svg>;
}

// Complex plane helpers
const CX = W / 2;
const CY = 140;
const R = 100; // radius of unit circle

function ComplexPlane({ children }: { children: React.ReactNode }) {
  return (
    <g>
      {/* Unit circle */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      {/* Axes */}
      <line x1={CX - R - 20} y1={CY} x2={CX + R + 20} y2={CY}
        stroke="#e2e8f0" strokeWidth={0.5} />
      <line x1={CX} y1={CY - R - 20} x2={CX} y2={CY + R + 20}
        stroke="#e2e8f0" strokeWidth={0.5} />
      <text x={CX + R + 25} y={CY + 3} fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Re</text>
      <text x={CX + 3} y={CY - R - 10} fontSize="7" fill={COLORS.mid}
        fontFamily={FONTS.sans}>Im</text>
      {children}
    </g>
  );
}

function Vector({ angle, r, color, label, dashed }: {
  angle: number; r: number; color: string; label: string; dashed?: boolean;
}) {
  const x = CX + Math.cos(angle) * r;
  const y = CY - Math.sin(angle) * r;
  return (
    <g>
      <line x1={CX} y1={CY} x2={x} y2={y}
        stroke={color} strokeWidth={2}
        strokeDasharray={dashed ? '4,3' : undefined} />
      <circle cx={x} cy={y} r={4} fill={color} />
      <text x={x + 8} y={y - 8} fontSize="8" fontWeight="600"
        fill={color} fontFamily={FONTS.sans}>{label}</text>
    </g>
  );
}

function ArcArrow({ fromAngle, toAngle, r, color, label }: {
  fromAngle: number; toAngle: number; r: number; color: string; label: string;
}) {
  const midAngle = (fromAngle + toAngle) / 2;
  const arcR = r + 15;
  const x1 = CX + Math.cos(fromAngle) * arcR;
  const y1 = CY - Math.sin(fromAngle) * arcR;
  const x2 = CX + Math.cos(toAngle) * arcR;
  const y2 = CY - Math.sin(toAngle) * arcR;
  const lx = CX + Math.cos(midAngle) * (arcR + 15);
  const ly = CY - Math.sin(midAngle) * (arcR + 15);
  const sweep = toAngle > fromAngle ? 0 : 1;
  return (
    <g>
      <path d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 0 ${sweep} ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3,2" />
      <text x={lx} y={ly} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={color} fontFamily={FONTS.mono}>{label}</text>
    </g>
  );
}

const qAngle = 0.4; // ~23°
const theta = 0.8; // base frequency
const mTheta = 3 * theta; // position m=3
const nTheta = 1 * theta; // position n=1

const createSteps = (locale: 'zh' | 'en') => {
  const t = {
    zh: {
      step1Title: '复数表示',
      step1Header: 'Step 1: Q 向量的一对维度在复平面上表示',
      step1Footer: '把相邻两个维度 (q₂ᵢ, q₂ᵢ₊₁) 看作复数 q₂ᵢ + q₂ᵢ₊₁·j',
      step2Title: '旋转编码',
      step2Header: 'Step 2: 乘以 e^(imθ)，向量旋转 mθ 角度',
      step2Footer: '位置 m 的 token 旋转 mθ — 复数乘法 = 旋转（高效 element-wise cos/sin）',
      qOriginal: 'q (原始)',
      step3Title: '相对位置',
      step3Header: 'Step 3: Q 和 K 旋转后，内积只取决于角度差 (m-n)θ',
      step3Formula: 'q̃ₘ · k̃ₙ* = q · k* · e^(i(m-n)θ) — 内积只依赖相对距离 m-n',
      step3Conclusion: '这就是 RoPE 实现相对位置编码的数学本质',
    },
    en: {
      step1Title: 'Complex Representation',
      step1Header: 'Step 1: Represent Q vector dimension pair on complex plane',
      step1Footer: 'View adjacent dimensions (q₂ᵢ, q₂ᵢ₊₁) as complex number q₂ᵢ + q₂ᵢ₊₁·j',
      step2Title: 'Rotation Encoding',
      step2Header: 'Step 2: Multiply by e^(imθ), vector rotates by mθ angle',
      step2Footer: 'Token at position m rotates by mθ — complex multiplication = rotation (efficient element-wise cos/sin)',
      qOriginal: 'q (original)',
      step3Title: 'Relative Position',
      step3Header: 'Step 3: After Q and K rotate, dot product only depends on angle difference (m-n)θ',
      step3Formula: 'q̃ₘ · k̃ₙ* = q · k* · e^(i(m-n)θ) — dot product only depends on relative distance m-n',
      step3Conclusion: 'This is the mathematical essence of RoPE relative position encoding',
    },
  }[locale];

  return [
    {
      title: t.step1Title,
      content: (
        <StepSvg>
          <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step1Header}
          </text>
          <ComplexPlane>
            <Vector angle={qAngle} r={R * 0.8} color={COLORS.primary} label="q = (q₂ᵢ, q₂ᵢ₊₁)" />
          </ComplexPlane>
          <text x={W / 2} y={SH - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            {t.step1Footer}
          </text>
        </StepSvg>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <StepSvg>
          <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step2Header}
          </text>
          <ComplexPlane>
            <Vector angle={qAngle} r={R * 0.8} color="#94a3b8" label={`q (${t.qOriginal.split(' ')[1]})`} dashed />
            <Vector angle={qAngle + mTheta} r={R * 0.8} color={COLORS.primary}
              label={`q̃ₘ = q · e^(i·${3}·θ)`} />
            <ArcArrow fromAngle={qAngle} toAngle={qAngle + mTheta}
              r={R * 0.8} color={COLORS.orange} label={`mθ = ${3}θ`} />
          </ComplexPlane>
          <text x={W / 2} y={SH - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}
            fontFamily={FONTS.sans}>
            {t.step2Footer}
          </text>
        </StepSvg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <StepSvg>
          <text x={W / 2} y={22} textAnchor="middle" fontSize="11" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step3Header}
          </text>
          <ComplexPlane>
            <Vector angle={qAngle + mTheta} r={R * 0.75} color={COLORS.primary}
              label="q̃ₘ (pos=3)" />
            <Vector angle={qAngle + 0.3 + nTheta} r={R * 0.7} color={COLORS.green}
              label="k̃ₙ (pos=1)" />
            <ArcArrow fromAngle={qAngle + nTheta + 0.3} toAngle={qAngle + mTheta}
              r={R * 0.65} color={COLORS.red} label="Δθ = (m-n)θ" />
          </ComplexPlane>
          <text x={W / 2} y={SH - 30} textAnchor="middle" fontSize="8"
            fill={COLORS.dark} fontFamily={FONTS.mono}>
            {t.step3Formula}
          </text>
          <text x={W / 2} y={SH - 14} textAnchor="middle" fontSize="8" fill={COLORS.green}
            fontFamily={FONTS.sans} fontWeight="600">
            {t.step3Conclusion}
          </text>
        </StepSvg>
      ),
    },
  ];
};

export default function RoPEComplexPlane({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const steps = createSteps(locale);
  return <StepNavigator steps={steps} />;
}
