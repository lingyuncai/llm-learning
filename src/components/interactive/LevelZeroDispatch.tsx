import React from 'react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const LevelZeroDispatch: React.FC = () => {
  const steps = [
    {
      title: '创建 Context',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* API call */}
            <rect x="40" y="30" width="280" height="45" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="60" y="50" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              zeContextCreate(driver, &desc, &context);
            </text>
            <text x="60" y="67" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              初始化运行时环境，绑定物理设备
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
              ze_context_handle_t
            </text>
            <text x="455" y="65" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid} textAnchor="middle">
              设备句柄容器
            </text>

            {/* Description */}
            <text x="40" y="105" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              Level Zero 的根对象，管理设备资源生命周期
            </text>
            <text x="40" y="125" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              类似 CUDA Context，但更轻量，多个 Context 可共享驱动状态
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: '创建 Module',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* SPIR-V input */}
            <rect x="30" y="30" width="120" height="40" fill={COLORS.purple} opacity="0.2" stroke={COLORS.purple} strokeWidth="1.5" rx="3" />
            <text x="90" y="47" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle" fontWeight="600">
              SPIR-V Binary
            </text>
            <text x="90" y="62" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
              kernel.spv
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
              zeModuleCreate(context, device,
            </text>
            <text x="260" y="61" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark} fontWeight="600">
              &moduleDesc, &module, &buildLog);
            </text>

            {/* JIT compile notice */}
            <rect x="200" y="85" width="340" height="28" fill={COLORS.orange} opacity="0.15" rx="3" />
            <text x="370" y="103" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.orange} textAnchor="middle" fontWeight="600">
              IGC JIT 编译发生在此！SPIR-V → Xe2 ISA
            </text>

            {/* Description */}
            <text x="30" y="132" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              Module 加载完成后，已包含针对当前硬件优化的原生机器码
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: '创建 Kernel',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* API call */}
            <rect x="40" y="30" width="320" height="45" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="60" y="48" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              zeKernelCreate(module, &kernelDesc,
            </text>
            <text x="100" y="64" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              &kernel);
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
              Kernel Handle
            </text>

            {/* Configuration */}
            <text x="40" y="100" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              配置 Kernel 参数：
            </text>
            <text x="60" y="118" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
              zeKernelSetGroupSize(kernel, groupSizeX, groupSizeY, groupSizeZ);
            </text>
            <text x="60" y="135" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.mid}>
              zeKernelSetArgumentValue(kernel, 0, sizeof(buffer), &buffer);
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: '创建 Command List',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* API call */}
            <rect x="40" y="30" width="380" height="45" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="60" y="48" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              zeCommandListCreate(context, device,
            </text>
            <text x="100" y="64" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark} fontWeight="600">
              &cmdListDesc, &cmdList);
            </text>

            {/* Command List visual */}
            <rect x="450" y="30" width="100" height="45" fill={COLORS.orange} opacity="0.2" stroke={COLORS.orange} strokeWidth="2" rx="4" />
            <text x="500" y="52" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle" fontWeight="600">
              Command List
            </text>

            {/* Description */}
            <text x="40" y="100" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark}>
              命令列表 = GPU 指令缓冲区，可批量记录多个操作
            </text>
            <text x="40" y="120" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              类似 Vulkan Command Buffer 或 DirectX Command List
            </text>
            <text x="40" y="137" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.green}>
              优势：多线程并行构建 Command List，减少 CPU 序列化瓶颈
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: 'Append & Submit',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* Append kernel */}
            <text x="40" y="30" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              1. 添加 Kernel 到 Command List
            </text>
            <rect x="50" y="35" width="480" height="22" fill={COLORS.purple} opacity="0.1" stroke={COLORS.purple} strokeWidth="1" rx="3" />
            <text x="60" y="50" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              zeCommandListAppendLaunchKernel(cmdList, kernel, &launchArgs, ...);
            </text>

            {/* Close list */}
            <text x="40" y="75" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              2. 关闭 Command List
            </text>
            <rect x="50" y="80" width="200" height="22" fill={COLORS.orange} opacity="0.1" stroke={COLORS.orange} strokeWidth="1" rx="3" />
            <text x="60" y="95" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark}>
              zeCommandListClose(cmdList);
            </text>

            {/* Submit */}
            <text x="40" y="120" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              3. 提交到 GPU 执行
            </text>
            <rect x="50" y="125" width="280" height="22" fill={COLORS.green} opacity="0.15" stroke={COLORS.green} strokeWidth="2" rx="3" />
            <text x="60" y="140" fontFamily={FONTS.mono} fontSize="10" fill={COLORS.dark} fontWeight="600">
              zeCommandQueueExecuteCommandLists(queue, 1, &cmdList);
            </text>

            {/* GPU execution icon */}
            <rect x="450" y="120" width="100" height="30" fill={COLORS.green} opacity="0.3" stroke={COLORS.green} strokeWidth="2" rx="4" />
            <text x="500" y="140" fontFamily={FONTS.sans} fontSize="12" fill={COLORS.dark} textAnchor="middle" fontWeight="700">
              GPU 执行中...
            </text>
          </svg>
        </div>
      ),
    },
    {
      title: '同步等待',
      content: (
        <div className="my-6 p-4 border rounded-lg">
          <svg viewBox="0 0 580 160" className="w-full">
            {/* Background */}
            <rect x="10" y="10" width="560" height="140" fill={COLORS.bgAlt} stroke={COLORS.mid} strokeWidth="1" rx="4" />

            {/* Fence */}
            <text x="40" y="30" fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
              使用 Fence 同步 CPU 与 GPU
            </text>
            <rect x="50" y="40" width="480" height="30" fill={COLORS.primary} opacity="0.15" stroke={COLORS.primary} strokeWidth="2" rx="4" />
            <text x="60" y="58" fontFamily={FONTS.mono} fontSize="11" fill={COLORS.dark}>
              zeFenceHostSynchronize(fence, UINT64_MAX); // 阻塞等待
            </text>

            {/* Timeline */}
            <line x1="60" y1="100" x2="520" y2="100" stroke={COLORS.mid} strokeWidth="2" />
            <circle cx="60" cy="100" r="5" fill={COLORS.primary} />
            <text x="60" y="120" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
              Submit
            </text>

            <circle cx="290" cy="100" r="5" fill={COLORS.orange} />
            <text x="290" y="120" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.mid} textAnchor="middle">
              GPU 执行
            </text>

            <circle cx="520" cy="100" r="5" fill={COLORS.green} />
            <text x="520" y="120" fontFamily={FONTS.sans} fontSize="9" fill={COLORS.green} textAnchor="middle" fontWeight="600">
              完成
            </text>

            {/* Result */}
            <text x="40" y="145" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid}>
              同步完成后，结果已写入内存，CPU 可安全访问
            </text>
          </svg>
        </div>
      ),
    },
  ];

  return <StepNavigator steps={steps} />;
};

export default LevelZeroDispatch;
