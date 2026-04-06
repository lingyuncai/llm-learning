import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const CompilationPipeline: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      step1Title: 'DPC++ 源码',
      step1Label: 'SYCL Kernel (C++ 模板)',
      step1Desc: '高层并行抽象，跨平台 (CPU/GPU/FPGA)',
      step2Title: 'LLVM IR',
      step2Label: 'DPC++ Frontend → LLVM 中间表示',
      step2Desc: 'SSA 形式，平台无关的优化层',
      step3Title: 'SPIR-V',
      step3Feature1: 'Khronos 标准',
      step3Feature2: '多厂商支持',
      step3Feature3: '二进制格式',
      step3Desc: 'LLVM IR → SPIR-V Backend，可移植到 Intel/AMD/ARM GPU',
      step4Title: 'Xe2 ISA (JIT)',
      step4Compiler: 'IGC (JIT Compiler)',
      step4CompilerDesc: '运行时编译，目标特定优化',
      step4Arch: 'Xe2-LPG 架构原生指令',
      step4Desc: 'SIMD16 向量指令 + LSC (Load/Store Cache) 消息',
      step4Latency: '启动延迟: 首次执行需 JIT 编译 (数十毫秒)',
      step5Title: 'GPU 执行',
      step5Submit: 'Level Zero Submit',
      step5EU: 'Xe2 执行单元 (EU) Grid',
      step5Desc: 'Work-groups 分发到 EU，SIMD 向量并行执行',
    },
    en: {
      step1Title: 'DPC++ Source',
      step1Label: 'SYCL Kernel (C++ Template)',
      step1Desc: 'High-level parallel abstraction, cross-platform (CPU/GPU/FPGA)',
      step2Title: 'LLVM IR',
      step2Label: 'DPC++ Frontend → LLVM Intermediate Representation',
      step2Desc: 'SSA form, platform-independent optimization layer',
      step3Title: 'SPIR-V',
      step3Feature1: 'Khronos Standard',
      step3Feature2: 'Multi-vendor Support',
      step3Feature3: 'Binary Format',
      step3Desc: 'LLVM IR → SPIR-V Backend, portable to Intel/AMD/ARM GPUs',
      step4Title: 'Xe2 ISA (JIT)',
      step4Compiler: 'IGC (JIT Compiler)',
      step4CompilerDesc: 'Runtime compilation, target-specific optimizations',
      step4Arch: 'Xe2-LPG architecture native instructions',
      step4Desc: 'SIMD16 vector instructions + LSC (Load/Store Cache) messages',
      step4Latency: 'Startup latency: first execution requires JIT compilation (tens of ms)',
      step5Title: 'GPU Execution',
      step5Submit: 'Level Zero Submit',
      step5EU: 'Xe2 Execution Unit (EU) Grid',
      step5Desc: 'Work-groups dispatched to EUs, SIMD vector parallel execution',
    },
  }[locale];
  const steps = [
    {
      title: t.step1Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* Code snippet */}
            <text x="30" y="35" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>
              queue.parallel_for(range&lt;1&gt;(N), [=](id&lt;1&gt; i) {'{'}
            </text>
            <text x="50" y="55" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>
              out[i] = in[i] * 2.0f;
            </text>
            <text x="30" y="75" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>
              {'}'});
            </text>

            {/* Label */}
            <text x="30" y="105" fontFamily={FONTS.sans} fontSize="13" fill={COLORS.primary} fontWeight="600">
              {t.step1Label}
            </text>
            <text x="30" y="125" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
              {t.step1Desc}
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step2Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* Arrow from source */}
            <path d="M 290 10 L 290 0" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* IR snippet */}
            <text x="30" y="35" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              define void @kernel(float* %in, float* %out) {'{'}
            </text>
            <text x="40" y="55" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              %1 = load float, float* %in
            </text>
            <text x="40" y="70" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              %2 = fmul float %1, 2.0
            </text>
            <text x="40" y="85" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              store float %2, float* %out
            </text>
            <text x="30" y="100" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              {'}'}
            </text>

            {/* Label */}
            <text x="30" y="125" fontFamily={FONTS.sans} fontSize="13" fill={COLORS.primary} fontWeight="600">
              {t.step2Label}
            </text>
            <text x="30" y="142" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step2Desc}
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step3Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* Binary representation */}
            <rect x="30" y="30" width="520" height="40" fill={COLORS.dark} opacity="0.1" rx="2" />
            <text x="40" y="50" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              0x07230203 0x00010000 0x00080000 0x00000014
            </text>
            <text x="40" y="64" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              OpTypeFloat %float 32 | OpFMul %result %a %const
            </text>

            {/* Features */}
            <rect x="30" y="85" width="150" height="28" fill={COLORS.primary} opacity="0.1" rx="3" />
            <text x="40" y="103" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.primary} fontWeight="600">
              {t.step3Feature1}
            </text>

            <rect x="195" y="85" width="150" height="28" fill={COLORS.green} opacity="0.1" rx="3" />
            <text x="205" y="103" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.green} fontWeight="600">
              {t.step3Feature2}
            </text>

            <rect x="360" y="85" width="150" height="28" fill={COLORS.orange} opacity="0.1" rx="3" />
            <text x="370" y="103" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.orange} fontWeight="600">
              {t.step3Feature3}
            </text>

            {/* Label */}
            <text x="30" y="135" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.mid}>
              {t.step3Desc}
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step4Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* IGC compiler box */}
            <rect x="30" y="25" width="220" height="50" fill={COLORS.purple} opacity="0.15" stroke={COLORS.purple} strokeWidth="2" rx="4" />
            <text x="80" y="48" fontFamily={FONTS.sans} fontSize="13" fill={COLORS.purple} fontWeight="700">
              {t.step4Compiler}
            </text>
            <text x="50" y="65" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step4CompilerDesc}
            </text>

            {/* Arrow */}
            <path d="M 250 50 L 280 50" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrowhead2)" />
            <defs>
              <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* ISA instructions */}
            <rect x="290" y="25" width="260" height="50" fill={COLORS.dark} opacity="0.08" rx="3" />
            <text x="300" y="43" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              send (16) r20 r10 0x02490000 // load
            </text>
            <text x="300" y="58" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              mul (16) r30 r20 2.0f
            </text>
            <text x="300" y="73" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              send (16) null r30 0x06090000 // store
            </text>

            {/* Hardware target */}
            <text x="30" y="105" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark} fontWeight="600">
              {t.step4Arch}
            </text>
            <text x="30" y="125" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step4Desc}
            </text>
            <text x="30" y="142" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.orange}>
              {t.step4Latency}
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step5Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* Level Zero submit */}
            <rect x="30" y="25" width="180" height="45" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="70" y="45" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.primary} fontWeight="700">
              {t.step5Submit}
            </text>
            <text x="45" y="62" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              zeCommandQueueExecute
            </text>

            {/* Arrow */}
            <path d="M 210 47 L 250 47" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrowhead3)" />
            <defs>
              <marker id="arrowhead3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* EU Grid */}
            <text x="260" y="30" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step5EU}
            </text>
            {[0, 1, 2, 3].map((row) => (
              <g key={row}>
                {[0, 1, 2, 3, 4, 5].map((col) => (
                  <rect
                    key={col}
                    x={260 + col * 48}
                    y={40 + row * 22}
                    width={42}
                    height={18}
                    fill={COLORS.green}
                    opacity="0.3"
                    stroke={COLORS.green}
                    strokeWidth="1"
                    rx="2"
                  />
                ))}
              </g>
            ))}
            <text x="260" y="142" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step5Desc}
            </text>
          </svg>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
};

export default CompilationPipeline;
