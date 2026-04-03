# AI Compute Stack 全景 — Design Spec

**Status:** Draft
**Date:** 2026-04-03
**Scope:** 1 new article, 3 interactive components, 1 new learning path

## 1. Overview

一篇科普性质的全景文章，讲清 AI/GPU 软件栈从推理框架到硬件 ISA 的**各层关系和职责边界**。重点解决"CUDA/OpenCL/SYCL 到底是什么"的多层混淆问题。

**文章：** `ai-compute-stack.mdx`
- **难度：** intermediate
- **Prerequisites：** 无
- **Tags：** `gpu`, `compute`, `software-stack`, `runtime`, `inference`

**学习路径：** 新建 `ai-compute-stack`，本文为第一篇入门

**设计原则：** 讲关系不讲实现。每层用 1-2 段讲清"是什么、为什么存在、跟谁对话"，不展开内部实现细节。

### 核心教学策略

**1. 为什么这些概念特别绕？**

根本原因：CUDA、OpenCL、SYCL、ROCm 这些名字不是"一个东西"，而是**"一套东西"的品牌名**，横跨多个抽象层。例如 OpenCL 既有编程语言（OpenCL C）又有 Runtime API，SYCL 是语言但 runtime 借用别人的（OpenCL RT / Level Zero / CUDA）。文章必须在开头就点明这个混淆来源，然后在 Section 7 做终极解剖。

**2. 关键类比（经过讨论验证，plan writer 必须使用）：**

| 概念 | 正确类比 | 错误类比（避免） |
|------|---------|----------------|
| Runtime | C Runtime (libc) / JRE — 提供 malloc/dispatch 等编程接口 | ~~操作系统~~（OS 的角色是 Driver） |
| Kernel | 一段可被 dispatch 到 GPU 并行执行的计算程序 | ~~一个函数~~（kernel 不自己跑，需要 runtime dispatch） |
| IR | Java bytecode — 平台无关的中间表示，由 driver 编译器做最终翻译 | ~~机器码~~（IR 不是最终可执行的） |
| Operator Library | 性能优化的算法库（如 Intel MKL / BLAS） | ~~标准库~~（标准库范围太广） |
| Driver | 包含编译器后端的硬件管理层 | ~~单纯的"驱动程序"~~（很多人不知道 driver 内含编译器） |

**3. 每层的教学模式：**
- 开头一句"为什么需要这层"（回答上一层留下的问题）
- 该层做什么（职责边界）
- 该层包含哪些技术（对比表）
- 和上下层的接口关系
- 常见误解/混淆点

---

## 2. Content Structure

**整体策略：** 方案 A+C 混合 — 开头用交互式全景栈图建立全局视野，然后自底向上逐层展开，每层开头用一句话回答"为什么需要这层"。

### Section 0: 全景概览（~10%）

- 交互式栈图（Component 1: StackLayerDiagram）— 让读者先建立 7 层全貌
- "一次 matmul 的旅程"（Component 2: MatmulJourney）— 端到端追踪 `model.forward()` 中一次矩阵乘法的完整调用链，从框架到硅片
- 引出核心困惑：为什么 CUDA 既是语言又是 runtime？为什么 OpenCL 和 SYCL 的关系这么绕？

### Section 1: Hardware ISA（~8%）

**为什么需要这层：** 这是 GPU 能直接执行的唯一东西 — 机器指令。

- ISA 是什么：GPU 能理解的二进制指令集（类比 CPU 的 x86/ARM）
- 厂商私有：NVIDIA SASS、AMD RDNA ISA、Intel Xe ISA、Apple GPU ISA — 互不兼容
- 为什么你不直接写 ISA：太底层、厂商不公开完整文档、换硬件就得重写
- PTX vs SASS（NVIDIA 特有）：PTX 是虚拟 ISA（稳定的中间层），SASS 是真实硬件 ISA（每代 GPU 不同）。driver 负责 PTX→SASS 的最终编译
- 引出：需要一层帮我们管理硬件细节 → Driver

### Section 2: Driver（~10%）

**为什么需要这层：** 屏蔽硬件差异，提供稳定接口给上层。

- Driver 是什么：操作系统级的硬件管理层，类似 CPU 世界的设备驱动
- **内含编译器**：把 IR（SPIR-V、PTX）翻译成硬件 ISA（SASS、Xe ISA 等）。这是很多人不知道的 — driver 不只是"驱动"，它有完整的编译器后端
  - NVIDIA：PTX → SASS（JIT 编译，每次加载 kernel 时执行）
  - Intel：SPIR-V → Xe ISA
  - AMD：LLVM IR / AMD IL → RDNA ISA
- **硬件资源管理**：GPU 内存分配/回收、计算单元调度、多进程隔离
- 为什么上层不直接和 driver 对话：driver 接口太底层（ioctl 级别），需要更友好的抽象 → Runtime

### Section 3: Runtime（~18%，重点节）

**为什么需要这层：** 给程序员一个"操作 GPU"的编程接口，封装 driver 的底层细节。

#### Runtime 做什么

- **Device discovery**：查询系统有哪些 GPU、它们的能力
- **Buffer 管理**：在 GPU 显存上分配/释放内存块（类比 CPU 的 malloc/free）
- **Command Queue / Command List**：
  - Queue：按顺序执行的操作序列（"先拷数据→跑 kernel→拷回来"）
  - Command List（Level Zero / Vulkan 风格）：预先录制一组命令，然后一次性提交。更显式、更高效，但编程更复杂
- **Kernel Dispatch**：把编译好的 kernel 程序加载到 GPU，配置线程网格参数（grid/block），提交执行
- **同步**：等待 GPU 完成、事件机制、barrier

#### 主要 Runtime 对比

| Runtime | 厂商 | 特点 | 适用场景 |
|---------|------|------|---------|
| CUDA Runtime API | NVIDIA | 最高层抽象，隐式上下文管理 | NVIDIA GPU 开发首选 |
| CUDA Driver API | NVIDIA | 更底层，显式控制上下文/模块 | 需要精细控制时 |
| OpenCL Runtime | Khronos（多厂商） | 跨平台，显式 buffer/queue 管理 | 需要跨厂商时 |
| Level Zero | Intel（规范厂商中立，但实际仅 Intel 实现） | 低开销、显式控制，oneAPI 的底层 runtime | Intel GPU / oneAPI 生态 |
| Vulkan (Compute) | Khronos（多厂商） | 极致显式控制，command buffer 录制 | 跨平台高性能计算 / 移动端 |
| Metal | Apple | Apple 专属，command buffer 模式 | Apple Silicon |

#### Kernel Dispatch 具体流程（以 OpenCL 为例）

文章中用伪代码/步骤展示一个 kernel 从加载到执行的完整流程，帮助读者理解 runtime 各概念的关系：

```
1. Platform/Device discovery — 查询有哪些 GPU
   platform = clGetPlatformIDs()
   device = clGetDeviceIDs(platform, GPU)

2. Context + Queue — 创建执行环境
   context = clCreateContext(device)
   queue = clCreateCommandQueue(context, device)

3. Buffer — 在 GPU 显存分配内存
   bufA = clCreateBuffer(context, size_A)  // 类比 malloc
   bufB = clCreateBuffer(context, size_B)
   bufC = clCreateBuffer(context, size_C)

4. 数据传输 — CPU → GPU
   clEnqueueWriteBuffer(queue, bufA, hostA)  // 拷贝矩阵 A 到显存
   clEnqueueWriteBuffer(queue, bufB, hostB)

5. Kernel 加载 — 从 SPIR-V 二进制创建可执行 kernel
   program = clCreateProgramWithIL(context, spirv_binary)
   kernel = clCreateKernel(program, "matmul")

6. 参数绑定 + Dispatch — 配置并提交到 GPU
   clSetKernelArg(kernel, 0, bufA)
   clSetKernelArg(kernel, 1, bufB)
   clSetKernelArg(kernel, 2, bufC)
   clEnqueueNDRangeKernel(queue, kernel, globalSize, localSize)

7. 同步 + 读回
   clFinish(queue)  // 等待 GPU 完成
   clEnqueueReadBuffer(queue, bufC, hostC)  // 结果拷回 CPU
```

这个流程将 Buffer、Queue、Kernel、Dispatch 的关系串联起来。CUDA Runtime API 做了更多隐式封装（自动管理 context），但底层逻辑相同。

#### Runtime 类比

GPU runtime 的角色类似 C Runtime (libc) 或 JRE：
- C Runtime 给你 `malloc/free` + `pthread_create` → GPU Runtime 给你 `bufferAlloc/free` + `kernelDispatch`
- 它不是操作系统（那是 Driver 的角色），而是**编程语言级的运行时库**

#### 常见混淆

- **CUDA Runtime API vs CUDA Driver API**：同一厂商的两层抽象。Runtime API 更简单（隐式 context），Driver API 更底层（显式控制一切）。大多数开发者只用 Runtime API。
- **Vulkan 不只是图形 API**：Vulkan Compute 可以跑通用计算 kernel，llama.cpp/ggml 就用它做跨平台 GPU 推理。
- **Level Zero vs OpenCL Runtime**：都是 Intel GPU 的 runtime，Level Zero 更新更底层（类似 Vulkan 的设计哲学），OpenCL Runtime 更老但更通用。

### Section 4: Language → Compiler → IR → Kernel（~20%，重点节）

**为什么需要这层：** 你需要用某种语言写出 GPU 能跑的程序（kernel），编译器把它翻译成 runtime 可以 dispatch 的格式。

#### 概念定义

- **Language**：你写 GPU 代码用的编程语言/扩展
- **Kernel**：一段编译好的、可被 runtime dispatch 到 GPU 上并行执行的计算程序。它自己不知道怎么跑 — 需要 runtime 来 allocate buffer、dispatch 它
- **Compiler**：Language → IR 的翻译器（nvcc, DPC++/ICX, clang, glslc, dxc 等）
- **IR (Intermediate Representation)**：编译后的中间字节码，还不是最终机器码。类比 Java bytecode — 平台无关，由 driver 里的编译器做最终翻译

#### GPU 编程语言全景

| Language | 生态 | 编译目标 (IR) | 特点 |
|----------|------|-------------|------|
| CUDA C++ | NVIDIA | PTX | NVIDIA 专属，最成熟生态 |
| HIP | AMD (ROCm) | AMD GPU IR / 可转译为 CUDA | AMD 对标 CUDA 的语言，语法几乎一致 |
| OpenCL C | Khronos | SPIR-V / 厂商私有 IL | 跨平台，C99 风格，较老 |
| SYCL | Khronos | SPIR-V (via DPC++) | 现代 C++ single-source，Intel 主推 |
| Triton | OpenAI | Triton IR → MLIR → LLVM IR → PTX(NVIDIA)/AMDGCN(AMD) | Python 风格写 kernel，自动 tiling，LLM 领域热门 |
| GLSL | Khronos | SPIR-V | 图形着色器语言，也可用于 compute shader |
| HLSL | Microsoft | DXIL / SPIR-V | DirectX 着色器语言，Shader Model 6+ |
| WGSL | W3C | SPIR-V / HLSL / MSL (via Tint/Naga，按后端选择) | WebGPU 的着色器语言 |
| Metal SL | Apple | Metal IR (AIR) | Apple 专属着色器语言 |
| Slang | 多机构研究→Khronos 开源 | SPIR-V / HLSL / Metal SL / CUDA / GLSL | 新一代跨平台着色器语言，多后端输出 |

#### Shader vs Kernel

- **Shader**：图形渲染管线中的可编程阶段（vertex shader, fragment shader, compute shader）
- **Kernel**：通用计算程序（CUDA kernel, OpenCL kernel）
- **Compute Shader** 是两个概念的交叉点 — 用图形 API（Vulkan/Metal/DX12）跑通用计算
- 在 AI 推理语境下，"kernel" 更常用；在图形语境下，"shader" 更常用。本质相同：一段跑在 GPU 上的并行程序

#### IR 对比

| IR | 对应语言 | 消费者 | 特点 |
|----|---------|--------|------|
| PTX | CUDA C++ | NVIDIA Driver | NVIDIA 专有虚拟 ISA，文本格式可读 |
| SPIR-V | OpenCL C, SYCL, GLSL, HLSL, WGSL, Slang | OpenCL RT, Vulkan, Level Zero | Khronos 标准，二进制格式，跨平台通用 |
| DXIL | HLSL | DirectX 12 Driver | Microsoft 专有 |
| Metal IR (AIR) | Metal SL | Metal Driver | Apple 专有 |
| LLVM IR | Triton (via MLIR), HIP | 各厂商 LLVM 后端 → PTX/AMDGCN/Xe | 通用编译器 IR，被多个工具链复用 |

### Section 5: Operator Library（~12%）

**为什么需要这层：** 手写 kernel 太难。算子库提供预优化的 kernel 集合 + 调用 runtime 的胶水代码。

- 算子库是什么：**预写好的高性能 kernel 集合 + 调用 runtime 的胶水代码**。对上层暴露 `matmul(A, B, C)` 接口，内部选择最优 kernel、配置 tiling 策略、通过 runtime API allocate buffer 并 dispatch
- 矩阵拆分在这里发生：大矩阵被切分成适合 GPU shared memory 的 tile，每个 tile 交给一个 kernel thread block 处理（不展开 tiling 算法细节，指向 TODO 的 GPU 编程专题）

| 算子库 | 厂商 | Runtime 依赖 | 覆盖算子 |
|--------|------|-------------|---------|
| cuDNN | NVIDIA | CUDA Runtime | 卷积、归一化、RNN、Attention |
| cuBLAS | NVIDIA | CUDA Runtime | 矩阵乘法、BLAS 运算 |
| oneDNN | Intel | OpenCL RT / Level Zero / CPU JIT | 卷积、MatMul、归一化（CPU+GPU） |
| MPS (Metal Performance Shaders) | Apple | Metal | 矩阵乘法、卷积、图像处理 |
| XNNPACK | Google | CPU 直接调用 | 移动端 CPU 优化算子 |
| rocBLAS / MIOpen | AMD | ROCm (HIP Runtime) | BLAS / 深度学习算子 |

#### 具体例子：oneDNN 内部怎么工作

oneDNN 是理解"算子库如何使用 kernel + runtime"的最好例子，因为它同时支持 CPU 和 GPU：

- **Intel GPU 路径**：kernel 用 OpenCL C 或 nGen JIT（Intel 自研 GPU JIT 生成器）编写 → 编译为 SPIR-V → 通过 OpenCL Runtime 或 Level Zero 提交到 GPU。NVIDIA/AMD GPU 路径则使用 SYCL。
- **CPU 路径**：使用 JIT 汇编生成器（Xbyak for x86, Xbyak_aarch64 for ARM），运行时动态生成针对当前 CPU 微架构优化的机器码
- **选择逻辑**：oneDNN 内部根据输入 tensor 的形状、数据类型、硬件类型，自动选择最优的 kernel 实现

这展示了算子库的本质：**kernel 集合 + runtime 胶水 + 自动选择策略**。

#### Triton 的特殊位置

Triton 介于手写 kernel 和算子库之间 — 你用 Python 风格写 kernel 逻辑，Triton 编译器自动做 tiling 和优化。它既是 Language（写 kernel），又部分承担了 Operator Library 的优化职责。PyTorch 2.0+ 的 `torch.compile` 后端大量使用 Triton 生成 kernel。

### Section 6: Inference Framework + Graph Optimizer（~12%）

**为什么需要这层：** 你不想手动调算子库的 API。推理框架加载模型文件，做图优化，把每个算子 dispatch 到对应的算子库/后端。

**注意：** 栈图（Component 1）中 Graph Optimizer 是独立层，但在文章内容中作为 Section 6 的子节讨论。原因：图优化器通常是推理框架的内置模块（如 TensorRT 的优化器、ONNX RT 的 graph transformer），而非独立可部署的组件。栈图中分开是为了视觉清晰，文章中合并讨论是因为它们在实际调用链中不可分离。

#### 框架做什么

1. **模型加载**：解析模型文件（.onnx, .tflite, .xml+.bin, .gguf）
2. **图优化**：算子融合（把 MatMul+BiasAdd+ReLU 融合成一个 kernel）、常量折叠、layout 转换
3. **调度**：把图中每个算子 dispatch 到对应的后端执行

#### 主要推理框架

| 框架 | 输入格式 | 后端机制 | 图优化器 | 典型调用链 |
|------|---------|---------|---------|-----------|
| ONNX Runtime | .onnx | Execution Provider 插件 | 内置 + 可选 | → CUDA EP → cuDNN → CUDA RT |
| TensorRT | .onnx / .plan | NVIDIA 专有引擎 | 激进优化（层融合、精度校准） | → 自有 kernel → CUDA RT |
| OpenVINO | 多种→内部 IR | 内置插件 | 内置 | → oneDNN(CPU) / OpenCL+L0(GPU) |
| LiteRT (TFLite) | .tflite | Delegate 插件 | 内置 | → GPU delegate → OpenCL/Vulkan |
| CoreML | .mlmodel/.mlpackage | Apple 专有 | 内置 | → MPS / ANE |
| llama.cpp | .gguf | ggml backends | 最小化 | → ggml → CUDA/Metal/Vulkan |

#### 图优化器的定位

TensorRT、XLA、Apache TVM 不是简单的推理框架 — 它们是**图级编译器**：
- 输入：计算图（算子序列）
- 输出：优化后的 kernel 调用序列
- 做的事：算子融合、内存规划、精度优化（FP16/INT8）、kernel 自动选择

它们介于 Framework 和 Operator Library 之间，把多个算子"编译"成更少、更高效的 kernel 调用。

#### llama.cpp / ggml 的垂直整合

传统分层路线：
```
ONNX Runtime → oneDNN → OpenCL Runtime → Driver
（每层独立，通过标准接口通信）
```

llama.cpp / ggml 的垂直整合：
```
llama.cpp → ggml ──→ 自己写的 CUDA kernel → CUDA Runtime
                 ──→ 自己写的 Metal kernel → Metal
                 ──→ 自己写的 Vulkan kernel → Vulkan
```

ggml 同时承担了 Operator Library + 部分 Kernel 的角色：
- **不依赖** cuDNN/oneDNN 等算子库
- 针对 LLM 推理场景**手写每个后端的 kernel**
- 自定义量化格式（GGUF）、融合算子
- 好处：极致控制、无依赖、易部署
- 代价：每加一个硬件后端都要从头写 kernel

### Section 7: 跨层品牌解剖（~10%）

**核心困惑终极解答：** 这些名字不是"一个东西"，而是"一套东西"的品牌名。

#### CUDA（NVIDIA）

| 层 | CUDA 对应的东西 |
|----|---------------|
| Language | CUDA C++ |
| Compiler | nvcc / NVRTC (JIT) |
| IR | PTX |
| Runtime | CUDA Runtime API / CUDA Driver API |
| Operator Library | cuDNN, cuBLAS, cuFFT, ... |
| Inference Framework | TensorRT |

#### OpenCL + SYCL（Khronos / Intel）

| 层 | OpenCL | SYCL |
|----|--------|------|
| Language | OpenCL C (C99 风格) | SYCL (现代 C++ single-source) |
| Compiler | 各厂商实现 | DPC++ (Intel), AdaptiveCpp |
| IR | SPIR-V | SPIR-V |
| Runtime | OpenCL Runtime | **借别人的** — 后端可选 OpenCL RT / Level Zero / CUDA |
| 关系 | 老一代跨平台标准 | 新一代 C++ 标准，可以用 OpenCL RT 作为后端 |

#### ROCm / HIP（AMD）

| 层 | ROCm 对应的东西 |
|----|----------------|
| Language | HIP (≈CUDA C++ 语法) |
| Compiler | hipcc (基于 Clang/LLVM) |
| IR | LLVM IR → AMD GPU ISA |
| Runtime | HIP Runtime (ROCr) |
| Operator Library | MIOpen, rocBLAS |

#### oneAPI（Intel）

| 层 | oneAPI 对应的东西 |
|----|-----------------|
| Language | SYCL (via DPC++) |
| Compiler | DPC++ / ICX |
| IR | SPIR-V |
| Runtime | Level Zero |
| Operator Library | oneDNN, oneMKL |

---

## 3. Interactive Components (3)

### Component 1: StackLayerDiagram

- **File:** `src/components/interactive/StackLayerDiagram.tsx`
- **Type:** 交互式分层架构图

**布局：** 纵向 7 层色块，从上到下：
1. Inference Framework（蓝色系）
2. Graph Optimizer（蓝色系浅）
3. Operator Library（绿色系）
4. Language + Compiler + IR（橙色系）
5. Runtime（紫色系）
6. Driver（灰色系）
7. Hardware ISA（深灰）

**每层展开时显示的技术节点：**

| 层 | 展开后显示的节点 |
|----|---------------|
| Inference Framework | ONNX Runtime, TensorRT, OpenVINO, LiteRT, CoreML, llama.cpp |
| Graph Optimizer | TensorRT optimizer, XLA, Apache TVM, torch.compile |
| Operator Library | cuDNN, cuBLAS, oneDNN, MPS, XNNPACK, rocBLAS/MIOpen, ggml |
| Language+Compiler+IR | CUDA C++ (nvcc→PTX), HIP (hipcc→LLVM IR), OpenCL C (→SPIR-V), SYCL (DPC++→SPIR-V), Triton (→LLVM IR), GLSL/HLSL/WGSL/Metal SL/Slang (→SPIR-V/DXIL/AIR) |
| Runtime | CUDA RT, CUDA Driver API, OpenCL RT, Level Zero, Vulkan, Metal, HIP RT |
| Driver | NVIDIA Driver (PTX→SASS), AMD Driver (→RDNA ISA), Intel Driver (SPIR-V→Xe ISA), Apple Driver (AIR→Apple GPU ISA) |
| Hardware ISA | NVIDIA SASS, AMD RDNA ISA, Intel Xe ISA, Apple GPU ISA, Qualcomm Adreno ISA |

**交互：**
- **默认：** 收起，只显示层名
- **点击层：** 展开显示该层包含的具体技术节点（上表数据）
- **展开两层时：** 显示层间调用关系箭头（如 Runtime↔Driver 之间的 "IR + dispatch 命令" 箭头）
- **底部品牌按钮：** CUDA / OpenCL+SYCL / ROCm / oneAPI — 点击后高亮该品牌横跨的所有层及其对应节点，其余变灰

**品牌高亮映射：**
- **CUDA**: Language(CUDA C++) + Compiler(nvcc) + IR(PTX) + Runtime(CUDA RT) + OpLib(cuDNN/cuBLAS) + Framework(TensorRT)
- **OpenCL+SYCL**: Language(OpenCL C, SYCL) + Compiler(DPC++, 各厂商) + IR(SPIR-V) + Runtime(OpenCL RT, Level Zero)
- **ROCm**: Language(HIP) + Compiler(hipcc) + IR(LLVM IR) + Runtime(HIP RT) + OpLib(rocBLAS/MIOpen)
- **oneAPI**: Language(SYCL/DPC++) + Compiler(DPC++/ICX) + IR(SPIR-V) + Runtime(Level Zero) + OpLib(oneDNN/oneMKL)

**技术：** SVG 布局 + motion 动画展开/收起 + 状态驱动高亮

### Component 2: MatmulJourney

- **File:** `src/components/interactive/MatmulJourney.tsx`
- **Type:** StepNavigator 步骤动画

**Steps（7 步）：**
1. **Inference Framework:** `model.forward()` 执行计算图，遇到 MatMul 算子
2. **Graph Optimizer:** 发现 MatMul + BiasAdd 可以融合成一个 fused kernel
3. **Operator Library:** 选择最优 kernel 实现，决定 tiling 策略（大矩阵 → 切成 tile）
4. **Language/Kernel:** 展示一小段伪 kernel 代码（每个 thread block 处理一个 tile）
5. **Runtime:** allocate buffer A,B,C → 创建 command queue → dispatch kernel(gridDim, blockDim)
6. **Driver:** 加载 PTX/SPIR-V → JIT 编译为硬件 ISA → 提交到 GPU
7. **Hardware:** SM/EU 执行，warp/wavefront 并行，结果写回显存

**每步右侧示意图内容：**

| Step | 右侧展示 |
|------|---------|
| 1. Framework | 一个简化的计算图（3-4 个算子节点连线），MatMul 节点高亮 |
| 2. Graph Optimizer | 同一计算图，MatMul+BiasAdd 节点合并成一个 FusedMatMul 节点，标注"算子融合" |
| 3. Operator Library | 一个大矩阵被网格线切成 2×2 的 tile 块，标注"选择 tiling 策略" |
| 4. Kernel | 一小段伪 kernel 代码框（`for tile in tiles: C[tile] += A[tile] × B[tile]`），标注 "每个 thread block 处理一个 tile" |
| 5. Runtime | 三个 buffer 方块（A, B, C）+ 一个 command queue 箭头流 → kernel dispatch 图标 |
| 6. Driver | IR 字节码方块 → 编译器齿轮图标 → ISA 二进制方块，标注 "JIT 编译" |
| 7. Hardware | 简化的 GPU die 示意（多个 SM/EU 方块），warp 箭头并行执行，结果箭头写回显存 |

**视觉：** 左侧简化栈图（7 层缩略，当前层高亮放大），右侧该步骤的 SVG 操作示意图

**技术：** StepNavigator primitive + SVG 双栏布局

### Component 3: EcosystemPathSelector

- **File:** `src/components/interactive/EcosystemPathSelector.tsx`
- **Type:** 场景路径选择器

**预设场景（5 条路径）：**
1. **PyTorch + CUDA (NVIDIA):** PyTorch → TensorRT/cuDNN → CUDA kernel → CUDA RT → NVIDIA Driver → SASS
2. **ONNX Runtime + oneAPI (Intel):** ONNX RT → oneDNN → SYCL kernel (SPIR-V) → Level Zero → Intel Driver → Xe ISA
3. **llama.cpp + Metal (Apple):** llama.cpp → ggml(=operator lib+kernel) → Metal → Apple Driver → Apple GPU ISA
4. **llama.cpp + Vulkan (跨平台):** llama.cpp → ggml(=operator lib+kernel) → Vulkan → 各厂商 Driver → 各 ISA
5. **LiteRT + OpenCL (移动端):** LiteRT → GPU delegate → OpenCL kernel → OpenCL RT → Mobile Driver → Mobile GPU ISA

**展示：** 和 StackLayerDiagram 相同的 7 层布局，选择场景后高亮路径上的技术节点，其余变灰

**llama.cpp 特殊处理：** ggml 节点横跨 Operator Library + Language/Kernel 两层（视觉上用一个跨层色块表示）

**底部：** 一句话特点总结（如 "NVIDIA 闭源全栈，最成熟但锁定厂商"）

**技术：** SVG 栈布局 + 按钮切换 + motion 淡入淡出

---

## 4. Learning Path

**File:** `src/content/paths/ai-compute-stack.yaml`

```yaml
id: ai-compute-stack
title: AI Compute Stack
description: 从推理框架到硬件指令集，理解 AI 软件栈的各层关系
locale: zh
difficulty: intermediate
articles:
  - ai-compute-stack   # 本文 — 全景概览
  # 后续可扩展：
  # - gpu-architecture (GPU 微架构)
  # - cuda-programming (CUDA 编程模型)
  # - kernel-optimization (Kernel 优化)
```

---

## 5. References

- NVIDIA CUDA Documentation — CUDA C++ Programming Guide
- Khronos Group — OpenCL Specification, SYCL Specification, SPIR-V Specification, Vulkan Specification
- Intel oneAPI Documentation — Level Zero Specification, DPC++ Compiler, oneDNN Developer Guide
- AMD ROCm Documentation — HIP Programming Guide
- Apple Developer — Metal Shading Language Specification, Metal Best Practices Guide
- Georgi Gerganov — ggml / llama.cpp GitHub repository
- ONNX Runtime Documentation — Execution Providers
- OpenAI Triton — Triton Language and Compiler Documentation
- NVIDIA TensorRT Documentation
- Intel OpenVINO Documentation
- Google LiteRT (TensorFlow Lite) Documentation

---

## 6. Component Summary

| # | Component | Type | 交互 |
|---|-----------|------|------|
| 1 | StackLayerDiagram | 交互式分层架构图 | 点击展开层、品牌高亮 |
| 2 | MatmulJourney | StepNavigator 步骤动画 | 7 步追踪调用链 |
| 3 | EcosystemPathSelector | 场景路径选择器 | 5 条路径切换高亮 |

Total: **1 article, 3 interactive components, 1 new learning path**
