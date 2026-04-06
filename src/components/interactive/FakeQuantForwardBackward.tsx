import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

export default function FakeQuantForwardBackward({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      step1Title: '1. FP32 Master Weight',
      step1MasterWeight: 'FP32 Master Weight',
      step1WeightValue: 'W = [0.347, -0.892, ...]',
      step1Precision: '全精度 32-bit',
      step1Desc1: '训练开始时初始化为全精度权重',
      step1Desc2: '整个训练过程始终保持 FP32 精度',
      step2Title: '2. Forward: Fake Quantization',
      step2FpMaster: 'FP32 Master',
      step2FakeQuant: 'Fake Quant',
      step2Quantize: 'Quantize',
      step2Dequantize: 'Dequantize',
      step2QuantWeight: '量化后权重',
      step2QuantNoise: '量化噪声 = 0.347 - 0.333 = 0.014',
      step2Desc: '前向传播通过伪量化节点，模拟量化精度损失',
      step3Title: '3. Forward: Compute Loss',
      step3MatMul: 'MatMul',
      step3Loss: 'Loss',
      step3Desc1: '使用量化后的权重计算前向传播',
      step3Desc2: 'Loss 反映了量化精度下的模型性能',
      step4Title: '4. Backward: STE 激活',
      step4SteActive: 'STE 激活',
      step4GradNote1: '梯度"穿过" round()',
      step4GradNote2: '恒等映射: ∂Q/∂W ≈ I',
      step4ForwardLabel: '→ 蓝色: 前向传播',
      step4BackwardLabel: '← 橙色: 反向传播',
      step4SteNote: '虚线框: STE 节点 (round 不可导，梯度直通)',
      step5Title: '5. Weight Update',
      step5UpdateTitle: 'FP32 Master Weight 更新',
      step5UpdateFormula: 'W_t+1 = W_t - η · ∂L/∂W',
      step5Precision: '始终保持全精度累积更新',
      step5SummaryTitle: 'QAT 核心机制总结',
      step5Summary1: '• 前向：通过 Fake Quant 模拟量化噪声',
      step5Summary2: '• 反向：STE 让梯度穿过不可导的 round() 操作',
      step5Summary3: '• 更新：Master Weight 保持 FP32 精度累积训练',
      step5Conclusion: '训练结束后直接量化为目标精度，模型已适应量化噪声',
    },
    en: {
      step1Title: '1. FP32 Master Weight',
      step1MasterWeight: 'FP32 Master Weight',
      step1WeightValue: 'W = [0.347, -0.892, ...]',
      step1Precision: 'Full precision 32-bit',
      step1Desc1: 'Initialize as full precision weights at training start',
      step1Desc2: 'Always maintain FP32 precision throughout training',
      step2Title: '2. Forward: Fake Quantization',
      step2FpMaster: 'FP32 Master',
      step2FakeQuant: 'Fake Quant',
      step2Quantize: 'Quantize',
      step2Dequantize: 'Dequantize',
      step2QuantWeight: 'Quantized Weight',
      step2QuantNoise: 'Quantization noise = 0.347 - 0.333 = 0.014',
      step2Desc: 'Forward pass through fake quantization node, simulating quantization precision loss',
      step3Title: '3. Forward: Compute Loss',
      step3MatMul: 'MatMul',
      step3Loss: 'Loss',
      step3Desc1: 'Compute forward pass using quantized weights',
      step3Desc2: 'Loss reflects model performance under quantized precision',
      step4Title: '4. Backward: STE Activation',
      step4SteActive: 'STE Active',
      step4GradNote1: 'Gradient "passes through" round()',
      step4GradNote2: 'Identity mapping: ∂Q/∂W ≈ I',
      step4ForwardLabel: '→ Blue: Forward pass',
      step4BackwardLabel: '← Orange: Backward pass',
      step4SteNote: 'Dashed box: STE node (round non-differentiable, gradient straight-through)',
      step5Title: '5. Weight Update',
      step5UpdateTitle: 'FP32 Master Weight Update',
      step5UpdateFormula: 'W_t+1 = W_t - η · ∂L/∂W',
      step5Precision: 'Always maintain full precision accumulation',
      step5SummaryTitle: 'QAT Core Mechanism Summary',
      step5Summary1: '• Forward: Simulate quantization noise via Fake Quant',
      step5Summary2: '• Backward: STE lets gradient pass through non-differentiable round()',
      step5Summary3: '• Update: Master Weight maintains FP32 precision accumulated training',
      step5Conclusion: 'After training, directly quantize to target precision, model adapted to quantization noise',
    },
  }[locale];

  const steps = [
    {
      title: t.step1Title,
      content: (
        <svg viewBox={`0 0 ${W} 250`} className="w-full">
          <rect x="200" y="30" width="180" height="80" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="290" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step1MasterWeight}
          </text>
          <text x="290" y="85" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.mono}>
            {t.step1WeightValue}
          </text>
          <text x="290" y="105" textAnchor="middle" fontSize="11" fill={COLORS.green} fontFamily={FONTS.sans}>
            {t.step1Precision}
          </text>
          <text x="290" y="160" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step1Desc1}
          </text>
          <text x="290" y="180" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step1Desc2}
          </text>
        </svg>
      ),
    },
    {
      title: t.step2Title,
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
          <text x="90" y="52" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2FpMaster}</text>
          <text x="90" y="72" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W = 0.347</text>
          <path d="M 150 57 L 195 57" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq-arrow-blue)"/>
          <rect x="195" y="20" width="110" height="120" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" strokeDasharray="4,2" rx="4"/>
          <text x="250" y="42" textAnchor="middle" fontSize="12" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2FakeQuant}</text>
          <rect x="208" y="55" width="85" height="24" fill={COLORS.bg} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
          <text x="250" y="72" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>{t.step2Quantize}</text>
          <path d="M 250 79 L 250 92" stroke={COLORS.mid} strokeWidth="1.5" markerEnd="url(#fq-arrow-gray)"/>
          <rect x="208" y="92" width="85" height="24" fill={COLORS.bg} stroke={COLORS.mid} strokeWidth="1" rx="2"/>
          <text x="250" y="109" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>{t.step2Dequantize}</text>
          <path d="M 305 80 L 365 80" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq-arrow-blue)"/>
          <rect x="365" y="50" width="130" height="55" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="430" y="72" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2QuantWeight}</text>
          <text x="430" y="92" textAnchor="middle" fontSize="10" fill={COLORS.red} fontFamily={FONTS.mono}>W_q = 0.333</text>
          <text x="430" y="170" textAnchor="middle" fontSize="11" fill={COLORS.red} fontFamily={FONTS.sans}>
            {t.step2QuantNoise}
          </text>
          <text x="290" y="200" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step2Desc}
          </text>
        </svg>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <svg viewBox={`0 0 ${W} 250`} className="w-full">
          <defs>
            <marker id="fq3-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill={COLORS.primary} />
            </marker>
          </defs>
          <rect x="30" y="40" width="95" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="77" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2FpMaster}</text>
          <text x="77" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W</text>
          <path d="M 125 62 L 165 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="165" y="40" width="95" height="45" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="2" strokeDasharray="4,2" rx="4"/>
          <text x="212" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2FakeQuant}</text>
          <text x="212" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Q(W)</text>
          <path d="M 260 62 L 300 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="300" y="40" width="95" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="347" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step3MatMul}</text>
          <text x="347" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Y = Q(W)X</text>
          <path d="M 395 62 L 435 62" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq3-arrow)"/>
          <rect x="435" y="40" width="80" height="45" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="475" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step3Loss}</text>
          <text x="475" y="75" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>L</text>
          <text x="290" y="130" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step3Desc1}
          </text>
          <text x="290" y="155" textAnchor="middle" fontSize="13" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step3Desc2}
          </text>
        </svg>
      ),
    },
    {
      title: t.step4Title,
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
          <text x="77" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2FpMaster}</text>
          <text x="77" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>W</text>
          <path d="M 125 48 L 165 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 165 68 L 125 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="165" y="30" width="105" height="50" fill={COLORS.highlight} stroke={COLORS.orange} strokeWidth="3" strokeDasharray="6,3" rx="4"/>
          <text x="217" y="48" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step2FakeQuant}</text>
          <text x="217" y="62" textAnchor="middle" fontSize="10" fontWeight="600" fill={COLORS.purple} fontFamily={FONTS.sans}>{t.step4SteActive}</text>
          <text x="217" y="75" textAnchor="middle" fontSize="9" fill={COLORS.mid} fontFamily={FONTS.mono}>∂L/∂W ≈ ∂L/∂Q(W)</text>
          <path d="M 270 48 L 310 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 310 68 L 270 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="310" y="30" width="95" height="50" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="357" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step3MatMul}</text>
          <text x="357" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>Y = Q(W)X</text>
          <path d="M 405 48 L 445 48" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#fq4-blue)"/>
          <path d="M 445 68 L 405 68" stroke={COLORS.orange} strokeWidth="2" markerEnd="url(#fq4-orange)"/>
          <rect x="445" y="30" width="80" height="50" fill={COLORS.bgAlt} stroke={COLORS.primary} strokeWidth="2" rx="4"/>
          <text x="485" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>{t.step3Loss}</text>
          <text x="485" y="68" textAnchor="middle" fontSize="10" fill={COLORS.mid} fontFamily={FONTS.mono}>L</text>
          <path d="M 217 80 L 217 120" stroke={COLORS.orange} strokeWidth="2" strokeDasharray="3,3"/>
          <text x="240" y="105" fontSize="10" fill={COLORS.purple} fontFamily={FONTS.sans}>{t.step4GradNote1}</text>
          <text x="240" y="120" fontSize="10" fill={COLORS.purple} fontFamily={FONTS.sans}>{t.step4GradNote2}</text>
          <rect x="30" y="145" width="520" height="50" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4"/>
          <text x="50" y="165" fontSize="11" fill={COLORS.primary} fontFamily={FONTS.sans}>{t.step4ForwardLabel}</text>
          <text x="250" y="165" fontSize="11" fill={COLORS.orange} fontFamily={FONTS.sans}>{t.step4BackwardLabel}</text>
          <text x="50" y="185" fontSize="11" fill={COLORS.purple} fontFamily={FONTS.sans}>{t.step4SteNote}</text>
        </svg>
      ),
    },
    {
      title: t.step5Title,
      content: (
        <svg viewBox={`0 0 ${W} 280`} className="w-full">
          <rect x="140" y="20" width="300" height="80" fill={COLORS.bgAlt} stroke={COLORS.green} strokeWidth="3" rx="4"/>
          <text x="290" y="45" textAnchor="middle" fontSize="14" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step5UpdateTitle}
          </text>
          <text x="290" y="68" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.mono}>
            {t.step5UpdateFormula}
          </text>
          <text x="290" y="90" textAnchor="middle" fontSize="11" fill={COLORS.green} fontFamily={FONTS.sans}>
            {t.step5Precision}
          </text>
          <rect x="40" y="120" width="500" height="85" fill={COLORS.highlight} stroke={COLORS.purple} strokeWidth="2" rx="4"/>
          <text x="290" y="145" textAnchor="middle" fontSize="13" fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            {t.step5SummaryTitle}
          </text>
          <text x="290" y="168" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step5Summary1}
          </text>
          <text x="290" y="185" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step5Summary2}
          </text>
          <text x="290" y="202" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step5Summary3}
          </text>
          <text x="290" y="240" textAnchor="middle" fontSize="12" fill={COLORS.mid} fontFamily={FONTS.sans}>
            {t.step5Conclusion}
          </text>
        </svg>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
}
