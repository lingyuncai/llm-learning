import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

// Ollama modules (blue)
const OLLAMA_MODULES = [
  { id: 'server', label: 'HTTP Server', x: 200, y: 50, w: 160, h: 32,
    desc: 'Gin HTTP server, 处理 /api/chat, /api/generate 等 API 请求' },
  { id: 'scheduler', label: 'Scheduler', x: 200, y: 100, w: 160, h: 32,
    desc: '调度器: 管理模型加载/卸载, 请求排队, 内存预算' },
  { id: 'llm', label: 'LLM Runner Manager', x: 200, y: 150, w: 160, h: 32,
    desc: '管理 runner 子进程的启动、健康检查和生命周期' },
];

// llama.cpp modules (orange)
const LLAMACPP_MODULES = [
  { id: 'ollamarunner', label: 'ollamarunner', x: 80, y: 230, w: 140, h: 32,
    desc: '纯 Go 推理引擎, ~21 架构, pipeline async 执行' },
  { id: 'llamarunner', label: 'llamarunner', x: 340, y: 230, w: 140, h: 32,
    desc: 'llama.cpp CGo 绑定, ~120+ 架构, 同步执行, 兼容性后备' },
  { id: 'ggml', label: 'GGML Backend', x: 170, y: 310, w: 220, h: 32,
    desc: '底层 tensor 计算库: 计算图构建、算子融合、多后端调度' },
  { id: 'backends', label: 'CUDA / Metal / Vulkan / CPU', x: 120, y: 360, w: 320, h: 28,
    desc: '硬件后端: CUDA (NVIDIA), Metal (Apple), Vulkan (跨平台), CPU (SIMD)' },
];

export default function OllamaArchitectureOverview() {
  const [selected, setSelected] = useState<string | null>(null);
  const selModule = [...OLLAMA_MODULES, ...LLAMACPP_MODULES].find(m => m.id === selected);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={COLORS.dark} fontFamily={FONTS.sans}>
          Ollama + llama.cpp 双层架构
        </text>

        {/* Language boundary labels */}
        <text x={30} y={70} fontSize="8" fontWeight="600" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Go</text>
        <text x={30} y={250} fontSize="8" fontWeight="600" fill={COLORS.orange}
          fontFamily={FONTS.sans}>Go / C++</text>
        <text x={30} y={330} fontSize="8" fontWeight="600" fill={COLORS.orange}
          fontFamily={FONTS.sans}>C</text>

        {/* Boundary line */}
        <line x1={50} y1={200} x2={530} y2={200}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,3" />
        <text x={540} y={204} fontSize="7" fill="#94a3b8" fontFamily={FONTS.sans}>
          进程边界
        </text>

        {/* Ollama modules (blue) */}
        {OLLAMA_MODULES.map(m => (
          <g key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={6}
              fill={selected === m.id ? '#bfdbfe' : '#dbeafe'}
              stroke={COLORS.primary} strokeWidth={selected === m.id ? 2 : 1.2} />
            <text x={m.x + m.w / 2} y={m.y + m.h / 2 + 4} textAnchor="middle"
              fontSize="9" fontWeight="600" fill={COLORS.primary} fontFamily={FONTS.sans}>
              {m.label}
            </text>
          </g>
        ))}

        {/* llama.cpp modules (orange) */}
        {LLAMACPP_MODULES.map(m => (
          <g key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={6}
              fill={selected === m.id ? '#fed7aa' : '#fef3c7'}
              stroke={COLORS.orange} strokeWidth={selected === m.id ? 2 : 1.2} />
            <text x={m.x + m.w / 2} y={m.y + m.h / 2 + 4} textAnchor="middle"
              fontSize="9" fontWeight="600" fill={COLORS.orange} fontFamily={FONTS.sans}>
              {m.label}
            </text>
          </g>
        ))}

        {/* Arrows: server → scheduler → llm */}
        <defs>
          <marker id="ola-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <line x1={280} y1={82} x2={280} y2={100}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />
        <line x1={280} y1={132} x2={280} y2={150}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />

        {/* LLM → runners (fork) */}
        <line x1={230} y1={182} x2={150} y2={230}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />
        <line x1={330} y1={182} x2={410} y2={230}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />

        {/* runners → ggml */}
        <line x1={150} y1={262} x2={230} y2={310}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />
        <line x1={410} y1={262} x2={330} y2={310}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />

        {/* ggml → backends */}
        <line x1={280} y1={342} x2={280} y2={360}
          stroke="#94a3b8" strokeWidth={1.2} markerEnd="url(#ola-arr)" />

        {/* HTTP annotation */}
        <text x={280} y={214} textAnchor="middle" fontSize="7" fill="#94a3b8"
          fontFamily={FONTS.sans}>localhost HTTP</text>
      </svg>

      {/* Detail panel */}
      {selModule && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border">
          <span className="font-semibold">{selModule.label}:</span> {selModule.desc}
        </div>
      )}
      {!selModule && (
        <p className="mt-2 text-xs text-gray-400 text-center">点击模块查看详情</p>
      )}
    </div>
  );
}
