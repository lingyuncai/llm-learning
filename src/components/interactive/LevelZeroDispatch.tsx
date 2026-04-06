import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const LevelZeroDispatch: React.FC<{ locale?: 'zh' | 'en' }> = ({ locale = 'zh' }) => {
  const t = {
    zh: {
      step1Title: '创建 Context',
      step1Api: 'zeContextCreate(driver, &desc, &context);',
      step1Description: '初始化运行时环境，绑定物理设备',
      step1Handle: 'ze_context_handle_t',
      step1HandleDesc: '设备句柄容器',
      step1Detail1: 'Level Zero 的根对象，管理设备资源生命周期',
      step1Detail2: '类似 CUDA Context，但更轻量，多个 Context 可共享驱动状态',
      step2Title: '创建 Module',
      step2Label: 'SPIR-V Binary',
      step2File: 'kernel.spv',
      step2Api1: 'zeModuleCreate(context, device,',
      step2Api2: '&moduleDesc, &module, &buildLog);',
      step2JIT: 'IGC JIT 编译发生在此！SPIR-V → Xe2 ISA',
      step2Detail: 'Module 加载完成后，已包含针对当前硬件优化的原生机器码',
      step3Title: '创建 Kernel',
      step3Api1: 'zeKernelCreate(module, &kernelDesc,',
      step3Api2: '&kernel);',
      step3Handle: 'Kernel Handle',
      step3Config: '配置 Kernel 参数：',
      step3GroupSize: 'zeKernelSetGroupSize(kernel, groupSizeX, groupSizeY, groupSizeZ);',
      step3Arg: 'zeKernelSetArgumentValue(kernel, 0, sizeof(buffer), &buffer);',
      step4Title: '创建 Command List',
      step4Api1: 'zeCommandListCreate(context, device,',
      step4Api2: '&cmdListDesc, &cmdList);',
      step4Handle: 'Command List',
      step4Detail1: '命令列表 = GPU 指令缓冲区，可批量记录多个操作',
      step4Detail2: '类似 Vulkan Command Buffer 或 DirectX Command List',
      step4Detail3: '优势：多线程并行构建 Command List，减少 CPU 序列化瓶颈',
      step5Title: 'Append & Submit',
      step5Step1: '1. 添加 Kernel 到 Command List',
      step5Api1: 'zeCommandListAppendLaunchKernel(cmdList, kernel, &launchArgs, ...);',
      step5Step2: '2. 关闭 Command List',
      step5Api2: 'zeCommandListClose(cmdList);',
      step5Step3: '3. 提交到 GPU 执行',
      step5Api3: 'zeCommandQueueExecuteCommandLists(queue, 1, &cmdList);',
      step5GPUExec: 'GPU 执行中...',
      step6Title: '同步等待',
      step6FenceTitle: '使用 Fence 同步 CPU 与 GPU',
      step6Api: 'zeFenceHostSynchronize(fence, UINT64_MAX); // 阻塞等待',
      step6Submit: 'Submit',
      step6GPUExec: 'GPU 执行',
      step6Complete: '完成',
      step6Detail: '同步完成后，结果已写入内存，CPU 可安全访问',
    },
    en: {
      step1Title: 'Create Context',
      step1Api: 'zeContextCreate(driver, &desc, &context);',
      step1Description: 'Initialize runtime environment, bind physical device',
      step1Handle: 'ze_context_handle_t',
      step1HandleDesc: 'Device handle container',
      step1Detail1: 'Root object of Level Zero, manages device resource lifetime',
      step1Detail2: 'Similar to CUDA Context, but lighter; multiple Contexts can share driver state',
      step2Title: 'Create Module',
      step2Label: 'SPIR-V Binary',
      step2File: 'kernel.spv',
      step2Api1: 'zeModuleCreate(context, device,',
      step2Api2: '&moduleDesc, &module, &buildLog);',
      step2JIT: 'IGC JIT compilation happens here! SPIR-V → Xe2 ISA',
      step2Detail: 'After Module loads, it contains native machine code optimized for current hardware',
      step3Title: 'Create Kernel',
      step3Api1: 'zeKernelCreate(module, &kernelDesc,',
      step3Api2: '&kernel);',
      step3Handle: 'Kernel Handle',
      step3Config: 'Configure Kernel parameters:',
      step3GroupSize: 'zeKernelSetGroupSize(kernel, groupSizeX, groupSizeY, groupSizeZ);',
      step3Arg: 'zeKernelSetArgumentValue(kernel, 0, sizeof(buffer), &buffer);',
      step4Title: 'Create Command List',
      step4Api1: 'zeCommandListCreate(context, device,',
      step4Api2: '&cmdListDesc, &cmdList);',
      step4Handle: 'Command List',
      step4Detail1: 'Command list = GPU instruction buffer, can batch multiple operations',
      step4Detail2: 'Similar to Vulkan Command Buffer or DirectX Command List',
      step4Detail3: 'Advantage: multi-thread parallel Command List building, reduce CPU serialization bottleneck',
      step5Title: 'Append & Submit',
      step5Step1: '1. Append Kernel to Command List',
      step5Api1: 'zeCommandListAppendLaunchKernel(cmdList, kernel, &launchArgs, ...);',
      step5Step2: '2. Close Command List',
      step5Api2: 'zeCommandListClose(cmdList);',
      step5Step3: '3. Submit to GPU for execution',
      step5Api3: 'zeCommandQueueExecuteCommandLists(queue, 1, &cmdList);',
      step5GPUExec: 'GPU executing...',
      step6Title: 'Synchronize & Wait',
      step6FenceTitle: 'Use Fence to sync CPU & GPU',
      step6Api: 'zeFenceHostSynchronize(fence, UINT64_MAX); // blocking wait',
      step6Submit: 'Submit',
      step6GPUExec: 'GPU execution',
      step6Complete: 'Complete',
      step6Detail: 'After sync completes, result is written to memory, CPU can safely access',
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

            {/* API call */}
            <rect x="40" y="30" width="280" height="45" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="60" y="50" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step1Api}
            </text>
            <text x="60" y="67" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step1Description}
            </text>

            {/* Arrow */}
            <path d="M 320 52 L 360 52" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-ctx)" />
            <defs>
              <marker id="arrow-ctx" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* Context object */}
            <rect x="370" y="30" width="170" height="45" fill={COLORS.dark} opacity="0.08" stroke={COLORS.dark} strokeWidth="1" rx="4" />
            <text x="455" y="48" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark} textAnchor="middle" fontWeight="700">
              {t.step1Handle}
            </text>
            <text x="455" y="65" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid} textAnchor="middle">
              {t.step1HandleDesc}
            </text>

            {/* Description */}
            <text x="40" y="105" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {t.step1Detail1}
            </text>
            <text x="40" y="125" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step1Detail2}
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

            {/* SPIR-V input */}
            <rect x="30" y="30" width="120" height="40" fill={COLORS.purple} opacity="0.2" stroke={COLORS.purple} strokeWidth="1.5" rx="3" />
            <text x="90" y="47" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle" fontWeight="600">
              {t.step2Label}
            </text>
            <text x="90" y="62" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
              {t.step2File}
            </text>

            {/* Arrow */}
            <path d="M 150 50 L 190 50" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-mod)" />
            <defs>
              <marker id="arrow-mod" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* API call */}
            <rect x="200" y="25" width="340" height="50" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="220" y="45" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark} fontWeight="600">
              {t.step2Api1}
            </text>
            <text x="260" y="61" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark} fontWeight="600">
              {t.step2Api2}
            </text>

            {/* JIT compile notice */}
            <rect x="200" y="85" width="340" height="28" fill={COLORS.orange} opacity="0.15" rx="3" />
            <text x="370" y="103" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.orange} textAnchor="middle" fontWeight="600">
              {t.step2JIT}
            </text>

            {/* Description */}
            <text x="30" y="132" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step2Detail}
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

            {/* API call */}
            <rect x="40" y="30" width="320" height="45" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="60" y="48" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step3Api1}
            </text>
            <text x="100" y="64" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step3Api2}
            </text>

            {/* Arrow */}
            <path d="M 360 52 L 400 52" stroke={COLORS.primary} strokeWidth="2" markerEnd="url(#arrow-ker)" />
            <defs>
              <marker id="arrow-ker" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>

            {/* Kernel object */}
            <rect x="410" y="30" width="140" height="45" fill={COLORS.green} opacity="0.2" stroke={COLORS.green} strokeWidth="2" rx="4" />
            <text x="480" y="52" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark} textAnchor="middle" fontWeight="700">
              {t.step3Handle}
            </text>

            {/* Configuration */}
            <text x="40" y="100" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step3Config}
            </text>
            <text x="60" y="118" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
              {t.step3GroupSize}
            </text>
            <text x="60" y="135" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
              {t.step3Arg}
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

            {/* API call */}
            <rect x="40" y="30" width="380" height="45" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="60" y="48" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step4Api1}
            </text>
            <text x="100" y="64" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step4Api2}
            </text>

            {/* Command List visual */}
            <rect x="450" y="30" width="100" height="45" fill={COLORS.orange} opacity="0.2" stroke={COLORS.orange} strokeWidth="2" rx="4" />
            <text x="500" y="52" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle" fontWeight="600">
              {t.step4Handle}
            </text>

            {/* Description */}
            <text x="40" y="100" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              {t.step4Detail1}
            </text>
            <text x="40" y="120" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step4Detail2}
            </text>
            <text x="40" y="137" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.green}>
              {t.step4Detail3}
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

            {/* Append kernel */}
            <text x="40" y="30" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step5Step1}
            </text>
            <rect x="50" y="35" width="480" height="22" fill={COLORS.purple} opacity="0.1" stroke={COLORS.purple} strokeWidth="1" rx="3" />
            <text x="60" y="50" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              {t.step5Api1}
            </text>

            {/* Close list */}
            <text x="40" y="75" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step5Step2}
            </text>
            <rect x="50" y="80" width="200" height="22" fill={COLORS.orange} opacity="0.1" stroke={COLORS.orange} strokeWidth="1" rx="3" />
            <text x="60" y="95" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              {t.step5Api2}
            </text>

            {/* Submit */}
            <text x="40" y="120" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step5Step3}
            </text>
            <rect x="50" y="125" width="280" height="22" fill={COLORS.green} opacity="0.15" stroke={COLORS.green} strokeWidth="2" rx="3" />
            <text x="60" y="140" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark} fontWeight="600">
              {t.step5Api3}
            </text>

            {/* GPU execution icon */}
            <rect x="450" y="120" width="100" height="30" fill={COLORS.green} opacity="0.3" stroke={COLORS.green} strokeWidth="2" rx="4" />
            <text x="500" y="140" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark} textAnchor="middle" fontWeight="700">
              {t.step5GPUExec}
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: t.step6Title,
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* Fence */}
            <text x="40" y="30" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              {t.step6FenceTitle}
            </text>
            <rect x="50" y="40" width="480" height="30" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="60" y="58" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>
              {t.step6Api}
            </text>

            {/* Timeline */}
            <line x1="60" y1="100" x2="520" y2="100" stroke={COLORS.mid} strokeWidth="2" />
            <circle cx="60" cy="100" r="5" fill={COLORS.primary} />
            <text x="60" y="120" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
              {t.step6Submit}
            </text>

            <circle cx="290" cy="100" r="5" fill={COLORS.orange} />
            <text x="290" y="120" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
              {t.step6GPUExec}
            </text>

            <circle cx="520" cy="100" r="5" fill={COLORS.green} />
            <text x="520" y="120" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.green} textAnchor="middle" fontWeight="600">
              {t.step6Complete}
            </text>

            {/* Result */}
            <text x="40" y="145" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              {t.step6Detail}
            </text>
          </svg>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
};

export default LevelZeroDispatch;
