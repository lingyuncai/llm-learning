// src/components/interactive/shared/stackData.ts

// ============================================================
// Types
// ============================================================

export interface TechNode {
  id: string;
  label: string;
  brands: string[];  // 'cuda' | 'opencl-sycl' | 'rocm' | 'oneapi' | 'metal'
}

export interface StackLayer {
  id: string;
  name: string;
  color: string;
  nodes: TechNode[];
}

export interface EcoPath {
  id: string;
  label: string;
  description: string;
  highlightNodes: Record<string, string[]>;
  ggmlSpan?: boolean;
}

export interface Brand {
  id: string;
  label: string;
  color: string;
}

// ============================================================
// 7 Stack Layers (top → bottom in the diagram, but array index
// 0 = topmost = Inference Framework)
// ============================================================

export const STACK_LAYERS: StackLayer[] = [
  {
    id: 'framework',
    name: 'Inference Framework',
    color: '#1565c0',  // blue
    nodes: [
      { id: 'onnx-rt',    label: 'ONNX Runtime',  brands: [] },
      { id: 'tensorrt',   label: 'TensorRT',      brands: ['cuda'] },
      { id: 'openvino',   label: 'OpenVINO',      brands: ['oneapi'] },
      { id: 'litert',     label: 'LiteRT',         brands: [] },
      { id: 'coreml',     label: 'CoreML',         brands: ['metal'] },
      { id: 'llamacpp',   label: 'llama.cpp',      brands: [] },
    ],
  },
  {
    id: 'graph-opt',
    name: 'Graph Optimizer',
    color: '#1976d2',  // blue lighter
    nodes: [
      { id: 'trt-opt',      label: 'TensorRT optimizer', brands: ['cuda'] },
      { id: 'xla',          label: 'XLA',                brands: [] },
      { id: 'tvm',          label: 'Apache TVM',         brands: [] },
      { id: 'torch-compile',label: 'torch.compile',      brands: [] },
    ],
  },
  {
    id: 'operator-lib',
    name: 'Operator Library',
    color: '#2e7d32',  // green
    nodes: [
      { id: 'cudnn',    label: 'cuDNN',           brands: ['cuda'] },
      { id: 'cublas',   label: 'cuBLAS',          brands: ['cuda'] },
      { id: 'onednn',   label: 'oneDNN',          brands: ['oneapi'] },
      { id: 'mps',      label: 'MPS',             brands: ['metal'] },
      { id: 'xnnpack',  label: 'XNNPACK',         brands: [] },
      { id: 'rocblas',  label: 'rocBLAS/MIOpen',  brands: ['rocm'] },
      { id: 'ggml',     label: 'ggml',            brands: [] },
    ],
  },
  {
    id: 'language',
    name: 'Language + Compiler + IR',
    color: '#e65100',  // orange
    nodes: [
      { id: 'cuda-cpp',  label: 'CUDA C++ (nvcc→PTX)',             brands: ['cuda'] },
      { id: 'hip',       label: 'HIP (hipcc→LLVM IR)',             brands: ['rocm'] },
      { id: 'opencl-c',  label: 'OpenCL C (→SPIR-V)',              brands: ['opencl-sycl'] },
      { id: 'sycl',      label: 'SYCL (DPC++→SPIR-V)',             brands: ['opencl-sycl', 'oneapi'] },
      { id: 'triton',    label: 'Triton (→LLVM IR)',               brands: [] },
      { id: 'shaders',   label: 'GLSL/HLSL/WGSL/Metal SL/Slang',  brands: ['metal'] },
    ],
  },
  {
    id: 'runtime',
    name: 'Runtime',
    color: '#6a1b9a',  // purple
    nodes: [
      { id: 'cuda-rt',      label: 'CUDA Runtime',     brands: ['cuda'] },
      { id: 'cuda-drv-api', label: 'CUDA Driver API',   brands: ['cuda'] },
      { id: 'opencl-rt',    label: 'OpenCL Runtime',    brands: ['opencl-sycl'] },
      { id: 'level-zero',   label: 'Level Zero',        brands: ['oneapi'] },
      { id: 'vulkan',       label: 'Vulkan',            brands: [] },
      { id: 'metal-rt',     label: 'Metal',             brands: ['metal'] },
      { id: 'hip-rt',       label: 'HIP Runtime',       brands: ['rocm'] },
    ],
  },
  {
    id: 'driver',
    name: 'Driver',
    color: '#546e7a',  // blue-grey
    nodes: [
      { id: 'nvidia-drv', label: 'NVIDIA Driver (PTX→SASS)',          brands: ['cuda'] },
      { id: 'amd-drv',    label: 'AMD Driver (→RDNA ISA)',            brands: ['rocm'] },
      { id: 'intel-drv',  label: 'Intel Driver (SPIR-V→Xe ISA)',      brands: ['oneapi', 'opencl-sycl'] },
      { id: 'apple-drv',  label: 'Apple Driver (AIR→Apple GPU ISA)',   brands: ['metal'] },
    ],
  },
  {
    id: 'hardware',
    name: 'Hardware ISA',
    color: '#37474f',  // dark blue-grey
    nodes: [
      { id: 'sass',      label: 'NVIDIA SASS',      brands: ['cuda'] },
      { id: 'rdna',      label: 'AMD RDNA ISA',     brands: ['rocm'] },
      { id: 'xe-isa',    label: 'Intel Xe ISA',     brands: ['oneapi'] },
      { id: 'apple-isa', label: 'Apple GPU ISA',    brands: ['metal'] },
      { id: 'adreno',    label: 'Qualcomm Adreno',  brands: [] },
    ],
  },
];

// ============================================================
// Brand Definitions (for StackLayerDiagram brand filter buttons)
// ============================================================

export const BRANDS: Brand[] = [
  { id: 'cuda',         label: 'CUDA',          color: '#76b900' },
  { id: 'opencl-sycl',  label: 'OpenCL + SYCL', color: '#ed1c24' },
  { id: 'rocm',         label: 'ROCm',          color: '#7f1d1d' },
  { id: 'oneapi',       label: 'oneAPI',        color: '#0071c5' },
  { id: 'metal',        label: 'Metal',         color: '#a3aaae' },
];

// ============================================================
// Ecosystem Paths (for EcosystemPathSelector)
// ============================================================

export const ECO_PATHS: EcoPath[] = [
  {
    id: 'tensorrt-cuda',
    label: 'TensorRT + CUDA (NVIDIA)',
    description: 'NVIDIA 闭源全栈，最成熟但锁定厂商',
    highlightNodes: {
      framework:      ['tensorrt'],
      'graph-opt':    ['trt-opt'],
      'operator-lib': ['cudnn', 'cublas'],
      language:       ['cuda-cpp'],
      runtime:        ['cuda-rt'],
      driver:         ['nvidia-drv'],
      hardware:       ['sass'],
    },
  },
  {
    id: 'onnxrt-oneapi',
    label: 'ONNX Runtime + oneAPI (Intel)',
    description: 'Intel 开放生态，SYCL 语言可跨平台',
    highlightNodes: {
      framework:      ['onnx-rt'],
      'graph-opt':    [],
      'operator-lib': ['onednn'],
      language:       ['sycl'],
      runtime:        ['level-zero'],
      driver:         ['intel-drv'],
      hardware:       ['xe-isa'],
    },
  },
  {
    id: 'llamacpp-metal',
    label: 'llama.cpp + Metal (Apple)',
    description: 'Apple 原生推理，ggml 垂直整合跳过算子库',
    highlightNodes: {
      framework:      ['llamacpp'],
      'graph-opt':    [],
      'operator-lib': ['ggml'],
      language:       ['shaders'],
      runtime:        ['metal-rt'],
      driver:         ['apple-drv'],
      hardware:       ['apple-isa'],
    },
    ggmlSpan: true,
  },
  {
    id: 'llamacpp-vulkan',
    label: 'llama.cpp + Vulkan (跨平台)',
    description: '跨平台 GPU 推理，Vulkan 覆盖大多数硬件',
    highlightNodes: {
      framework:      ['llamacpp'],
      'graph-opt':    [],
      'operator-lib': ['ggml'],
      language:       ['shaders'],
      runtime:        ['vulkan'],
      driver:         ['nvidia-drv', 'amd-drv', 'intel-drv'],
      hardware:       ['sass', 'rdna', 'xe-isa'],
    },
    ggmlSpan: true,
  },
  {
    id: 'litert-opencl',
    label: 'LiteRT + OpenCL (移动端)',
    description: '移动端推理，OpenCL 广泛支持移动 GPU',
    highlightNodes: {
      framework:      ['litert'],
      'graph-opt':    [],
      'operator-lib': ['xnnpack'],
      language:       ['opencl-c'],
      runtime:        ['opencl-rt'],
      driver:         [],
      hardware:       ['adreno'],
    },
  },
];
