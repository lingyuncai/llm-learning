import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

export default function FakeQuantForwardBackward() {
  const steps = [
    {
      title: '1. FP32 Master Weight',
      content: (
        <svg viewBox={`0 0 ${W} 250`} className="w-full">
          <rect x="200" y="30" width="180" height="80" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="290" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            FP32 Master Weight
          </text>
          <text x="290" y="85" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.mono}>
            W = [0.347, -0.892, ...]
          </text>
          <text x="290" y="105" textAnchor="middle" fontSize="11" fill={COLORS.green} fontFamily={FONTS.sans}>
            全精度 32-bit
          </text>
          <text x="290" y="160" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            训练开始时初始化为全精度权重
          </text>
          <text x="290" y="180" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            整个训练过程始终保持 FP32 精度
          </text>
        </svg>
      ),
    },
    {
      title: '2. Forward: Fake Quantization',
      content: (
        <svg viewBox={`0 0 ${W} 250`} className="w-full">
          <defs>
            <marker id="fq-arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.primary} />
            </marker>
            <marker id="fq-arrow-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.mid} />
            </marker>
          </defs>
          <rect x="30" y="30" width="120" height="55" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="90" y="52" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>FP32 Master</text>
          <text x="90" y="72" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W = 0.347</text>
          <path d="M 150 57 L 195 57" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq-arrow-blue)"/>
          <rect x="195" y="20" width="110" height="120" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" strokeDasharray="4,2" rx="4"/>
          <text x="250" y="42" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Fake Quant</text>
          <rect x="208" y="55" width="85" height="24" fill={COLORS.bg} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
          <text x="250" y="72" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Quantize</text>
          <path d="M 250 79 L 250 92" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#fq-arrow-gray)"/>
          <rect x="208" y="92" width="85" height="24" fill={COLORS.bg} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
          <text x="250" y="109" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Dequantize</text>
          <path d="M 305 80 L 365 80" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq-arrow-blue)"/>
          <rect x="365" y="50" width="130" height="55" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="430" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>量化后权重</text>
          <text x="430" y="92" textAnchor="middle" fontSize="10" fill={COLORS.red} fontFamily={FONTS.mono}>W_q = 0.333</text>
          <text x="430" y="170" textAnchor="middle" fontSize="11" fill={COLORS.red} fontFamily={FONTS.sans}>
            量化噪声 = 0.347 - 0.333 = 0.014
          </text>
          <text x="290" y="200" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            前向传播通过伪量化节点，模拟量化精度损失
          </text>
        </svg>
      ),
    },
    {
      title: '3. Forward: Compute Loss',
      content: (
        <svg viewBox={`0 0 ${W} 250`} className="w-full">
          <defs>
            <marker id="fq3-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.primary} />
            </marker>
          </defs>
          <rect x="30" y="40" width="95" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="77" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>FP32 Master</text>
          <text x="77" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W</text>
          <path d="M 125 62 L 165 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="165" y="40" width="95" height="45" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" strokeDasharray="4,2" rx="4"/>
          <text x="212" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Fake Quant</text>
          <text x="212" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Q(W)</text>
          <path d="M 260 62 L 300 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="300" y="40" width="95" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="347" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>MatMul</text>
          <text x="347" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Y = Q(W)X</text>
          <path d="M 395 62 L 435 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="435" y="40" width="80" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="475" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Loss</text>
          <text x="475" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>L</text>
          <text x="290" y="130" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            使用量化后的权重计算前向传播
          </text>
          <text x="290" y="155" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            Loss 反映了量化精度下的模型性能
          </text>
        </svg>
      ),
    },
    {
      title: '4. Backward: STE 激活',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <defs>
            <marker id="fq4-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.primary} />
            </marker>
            <marker id="fq4-orange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.orange} />
            </marker>
          </defs>
          <rect x="30" y="30" width="95" height="50" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="77" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>FP32 Master</text>
          <text x="77" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W</text>
          <path d="M 125 48 L 165 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 165 68 L 125 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="165" y="30" width="105" height="50" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="3" strokeDasharray="6,3" rx="4"/>
          <text x="217" y="48" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Fake Quant</text>
          <text x="217" y="62" textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>STE 激活</text>
          <text x="217" y="75" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>∂L/∂W ≈ ∂L/∂Q(W)</text>
          <path d="M 270 48 L 310 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 310 68 L 270 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="310" y="30" width="95" height="50" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="357" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>MatMul</text>
          <text x="357" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Y = Q(W)X</text>
          <path d="M 405 48 L 445 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 445 68 L 405 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="445" y="30" width="80" height="50" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="485" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>Loss</text>
          <text x="485" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>L</text>
          <path d="M 217 80 L 217 120" stroke={COLORS.orange} strokeWidth="2" strokeDasharray="3,3"/>
          <text x="240" y="105" fontSize="10" fill={COLORS.purple} fontFamily={FONTS.sans}>梯度"穿过" round()</text>
          <text x="240" y="120" fontSize="10" fill={COLORS.purple} fontFamily={FONTS.sans}>恒等映射: ∂Q/∂W ≈ I</text>
          <rect x="30" y="145" width="520" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4"/>
          <text x="50" y="165" fontSize="11" fill={COLORS.primary} fontFamily={FONTS.sans}>→ 蓝色: 前向传播</text>
          <text x="250" y="165" fontSize="11" fill={COLORS.orange} fontFamily={FONTS.sans}>← 橙色: 反向传播</text>
          <text x="50" y="185" fontSize="11" fill={COLORS.purple} fontFamily={FONTS.sans}>虚线框: STE 节点 (round 不可导，梯度直通)</text>
        </svg>
      ),
    },
    {
      title: '5. Weight Update',
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <rect x="140" y="20" width="300" height="80" fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth="3" rx="4"/>
          <text x="290" y="45" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            FP32 Master Weight 更新
          </text>
          <text x="290" y="68" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.mono}>
            W_t+1 = W_t - η · ∂L/∂W
          </text>
          <text x="290" y="90" textAnchor="middle" fontSize="11" fill={COLORS.green} fontFamily={FONTS.sans}>
            始终保持全精度累积更新
          </text>
          <rect x="40" y="120" width="500" height="85" fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth="2" rx="4"/>
          <text x="290" y="145" textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            QAT 核心机制总结
          </text>
          <text x="290" y="168" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            • 前向：通过 Fake Quant 模拟量化噪声
          </text>
          <text x="290" y="185" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            • 反向：STE 让梯度穿过不可导的 round() 操作
          </text>
          <text x="290" y="202" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            • 更新：Master Weight 保持 FP32 精度累积训练
          </text>
          <text x="290" y="240" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            训练结束后直接量化为目标精度，模型已适应量化噪声
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
