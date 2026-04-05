import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

export default function BitNetArithmetic() {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  return (
    <svg viewBox={`0 0 ${W} 350`} className="w-full">
      <text x="290" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        传统 FP16 vs BitNet 三值计算对比
      </text>

      <g transform="translate(20, 45)">
        <text x="120" y="0" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
          传统 FP16 (2×2 × 2×2)
        </text>
        <rect x="10" y="15" width="100" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
        <text x="15" y="8" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>A =</text>
        <text x="30" y="35" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>0.8  -1.2</text>
        <text x="30" y="55" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>0.5   0.9</text>
        <text x="125" y="8" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>B =</text>
        <rect x="120" y="15" width="100" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
        <text x="130" y="35" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>0.6   0.3</text>
        <text x="130" y="55" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>-0.4  1.1</text>

        <rect x="0" y="80" width="240" height="80" fill={selectedCell === 0 ? COLORS.highlight : COLORS.bg}
          stroke={COLORS.primary} strokeWidth="1" rx="3" cursor="pointer"
          onClick={() => setSelectedCell(selectedCell === 0 ? null : 0)} />
        <text x="120" y="98" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Cell (0,0) 计算路径
        </text>
        <text x="10" y="118" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>0.8 × 0.6 = 0.48</text>
        <text x="10" y="135" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>+ (-1.2) × (-0.4) = 0.48</text>
        <text x="10" y="152" fontSize="10" fill={COLORS.green} fontFamily={FONTS.mono}>= 0.96</text>
        <text x="160" y="118" fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans}>2 次乘法</text>
        <text x="160" y="135" fontSize="9" fill={COLORS.orange} fontFamily={FONTS.sans}>1 次加法</text>

        <rect x="0" y="175" width="240" height="40" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="3"/>
        <text x="120" y="193" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          总计: 4 次乘法 + 2 次加法
        </text>
        <text x="120" y="208" textAnchor="middle" fontSize="10" fill={COLORS.red} fontFamily={FONTS.mono}>= 6 FLOPs</text>
      </g>

      <g transform="translate(300, 45)">
        <text x="120" y="0" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>
          BitNet 三值 (2×2 × 2×2)
        </text>
        <rect x="10" y="15" width="90" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
        <text x="15" y="8" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>A =</text>
        <text x="25" y="35" fontSize="11" fill={COLORS.green} fontFamily={FONTS.mono}>+1  -1</text>
        <text x="25" y="55" fontSize="11" fill={COLORS.green} fontFamily={FONTS.mono}>+1  +1</text>
        <text x="115" y="8" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>B =</text>
        <rect x="110" y="15" width="90" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
        <text x="120" y="35" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>+1   0</text>
        <text x="120" y="55" fontSize="11" fill={COLORS.dark} fontFamily={FONTS.mono}>-1  +1</text>

        <rect x="0" y="80" width="240" height="80" fill={selectedCell === 1 ? COLORS.highlight : COLORS.bg}
          stroke={COLORS.purple} strokeWidth="1" rx="3" cursor="pointer"
          onClick={() => setSelectedCell(selectedCell === 1 ? null : 1)} />
        <text x="120" y="98" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          Cell (0,0) 计算路径
        </text>
        <text x="10" y="118" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>(+1)×(+1) → add X</text>
        <text x="10" y="135" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>(-1)×(-1) → add X</text>
        <text x="10" y="152" fontSize="10" fill={COLORS.green} fontFamily={FONTS.mono}>= +2 (0 次乘法)</text>
        <text x="160" y="118" fontSize="9" fill={COLORS.green} fontFamily={FONTS.sans}>0 次乘法</text>
        <text x="160" y="135" fontSize="9" fill={COLORS.green} fontFamily={FONTS.sans}>2 次加法</text>

        <rect x="0" y="175" width="240" height="40" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="3"/>
        <text x="120" y="193" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
          总计: 0 次乘法 + 2 次加减
        </text>
        <text x="120" y="208" textAnchor="middle" fontSize="10" fill={COLORS.green} fontFamily={FONTS.mono}>+ 2 次跳过 (W=0)</text>
      </g>

      <rect x="40" y="295" width="500" height="35" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" rx="4"/>
      <text x="290" y="310" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
        关键优势：BitNet 完全消除乘法运算
      </text>
      <text x="290" y="325" textAnchor="middle" fontSize="11" fill={COLORS.mid} fontFamily={FONTS.sans}>
        {'{-1, 0, +1}'} 只需加法器和符号位，无需浮点乘法单元
      </text>

      <text x="290" y="345" textAnchor="middle" fontSize="10" fontStyle="italic" fill={COLORS.mid} fontFamily={FONTS.sans}>
        点击计算路径框查看详细步骤
      </text>
    </svg>
  );
}
