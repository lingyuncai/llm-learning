import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

// 4x4 mock matrices for visualization
const S_ORIG = [
  [0.42, 0.18, -0.05, 0.31],
  [0.28, 0.55, 0.09, -0.12],
  [-0.15, 0.33, 0.61, 0.14],
  [0.08, -0.22, 0.19, 0.47],
];
// Key quantization introduces dot-product amplified errors
const S_KQUANT = [
  [0.39, 0.21, -0.08, 0.28],
  [0.25, 0.50, 0.14, -0.16],
  [-0.19, 0.29, 0.55, 0.18],
  [0.12, -0.18, 0.23, 0.42],
];
// Value quantization errors get averaged out
const O_ORIG = [
  [0.72, -0.18, 0.35, 0.51],
  [0.64, 0.42, -0.08, 0.33],
  [-0.11, 0.78, 0.49, -0.15],
  [0.38, 0.15, 0.69, 0.44],
];
const O_VQUANT = [
  [0.71, -0.17, 0.34, 0.50],
  [0.63, 0.41, -0.07, 0.32],
  [-0.10, 0.77, 0.48, -0.14],
  [0.37, 0.14, 0.68, 0.43],
];

function errColor(err: number, maxErr: number): string {
  const t = err / maxErr;
  if (t > 0.6) return COLORS.red;
  if (t > 0.3) return COLORS.orange;
  return COLORS.green;
}

function valColor(val: number): string {
  if (val > 0.4) return COLORS.primary;
  if (val > 0.1) return '#5c9ce6';
  if (val > -0.1) return COLORS.bgAlt;
  return '#e89090';
}

function Matrix({ data, x, y, label, colorFn }: {
  data: number[][]; x: number; y: number; label: string;
  colorFn: (v: number) => string;
}) {
  const cell = 38;
  return (
    <g>
      <text x={x} y={y - 8} fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{label}</text>
      {data.map((row, i) => row.map((val, j) => (
        <g key={`${i}-${j}`}>
          <rect x={x + j * cell} y={y + i * cell} width={cell - 2} height={cell - 2}
            fill={colorFn(val)} stroke={COLORS.light} strokeWidth="1" rx="2" />
          <text x={x + j * cell + cell / 2} y={y + i * cell + cell / 2 + 4}
            textAnchor="middle" fontSize="9" fontWeight="600" fill={COLORS.dark}
            fontFamily={FONTS.mono}>{val.toFixed(2)}</text>
        </g>
      )))}
    </g>
  );
}

export default function KVQuantSensitivity() {
  const errK = S_ORIG.map((row, i) => row.map((v, j) => Math.abs(v - S_KQUANT[i][j])));
  const errV = O_ORIG.map((row, i) => row.map((v, j) => Math.abs(v - O_VQUANT[i][j])));
  const maxErrK = Math.max(...errK.flat());
  const maxErrV = Math.max(...errV.flat());

  const steps = [
    {
      title: '1. 原始 Attention Scores',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            S = QK^T / √d (全精度)
          </text>
          <Matrix data={S_ORIG} x={190} y={50} label="Attention Scores S"
            colorFn={valColor} />
          <text x={W / 2} y={240} textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
            Baseline: 全精度 Q 和 K 计算的 attention scores
          </text>
        </svg>
      ),
    },
    {
      title: '2. 量化 Key → Score 误差',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            S' = Q · quant(K)^T / √d
          </text>
          <Matrix data={S_KQUANT} x={40} y={50} label="S' (Key 量化后)"
            colorFn={valColor} />
          <Matrix data={errK} x={280} y={50} label="误差热力图"
            colorFn={(v) => errColor(v, maxErrK)} />
          <text x={280} y={220} fontSize="10" fontWeight="600" fill={COLORS.red} fontFamily={FONTS.sans}>
            点积放大了 Key 量化误差
          </text>
          <text x={280} y={236} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
            max error = {maxErrK.toFixed(3)}
          </text>
        </svg>
      ),
    },
    {
      title: '3. 量化 Value → Output 误差',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={25} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            O' = softmax(S) · quant(V)
          </text>
          <Matrix data={O_VQUANT} x={40} y={50} label="O' (Value 量化后)"
            colorFn={valColor} />
          <Matrix data={errV} x={280} y={50} label="误差热力图"
            colorFn={(v) => errColor(v, maxErrV)} />
          <text x={280} y={220} fontSize="10" fontWeight="600" fill={COLORS.green} fontFamily={FONTS.sans}>
            加权求和有平均效应，误差较小
          </text>
          <text x={280} y={236} fontSize="10" fill={COLORS.mid} fontFamily={FONTS.sans}>
            max error = {maxErrV.toFixed(3)}
          </text>
        </svg>
      ),
    },
    {
      title: '4. 结论：Key 需要更高精度',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <text x={W / 2} y={30} textAnchor="middle" fontSize="15" fontWeight="700"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            KV Quantization Sensitivity
          </text>
          <rect x={70} y={60} width={440} height={70} fill={COLORS.bgAlt}
            stroke={COLORS.red} strokeWidth="2" rx="6" />
          <text x={290} y={85} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.red} fontFamily={FONTS.sans}>Key 量化误差: 高</text>
          <text x={290} y={105} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Q·K 点积放大量化噪声 → Key 需要 FP16/FP8
          </text>
          <rect x={70} y={150} width={440} height={70} fill={COLORS.bgAlt}
            stroke={COLORS.green} strokeWidth="2" rx="6" />
          <text x={290} y={175} textAnchor="middle" fontSize="13" fontWeight="600"
            fill={COLORS.green} fontFamily={FONTS.sans}>Value 量化误差: 低</text>
          <text x={290} y={195} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            加权求和平均噪声 → Value 可用 INT8/INT4
          </text>
          <text x={W / 2} y={255} textAnchor="middle" fontSize="11"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            实践策略: 非对称量化 (Key INT8 + Value INT4)
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
