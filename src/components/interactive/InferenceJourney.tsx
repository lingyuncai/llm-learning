import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

// Helper: colored box for Ollama (blue) or llama.cpp (orange)
function LayerBox({ x, y, w, h, label, sub, side }: {
  x: number; y: number; w: number; h: number;
  label: string; sub: string; side: 'ollama' | 'llamacpp' | 'both';
}) {
  const fill = side === 'ollama' ? '#dbeafe' : side === 'llamacpp' ? '#fef3c7' : '#f0e6ff';
  const stroke = side === 'ollama' ? COLORS.primary : side === 'llamacpp' ? COLORS.orange : '#7c3aed';
  const textFill = side === 'ollama' ? COLORS.primary : side === 'llamacpp' ? COLORS.orange : '#7c3aed';
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" fontSize="9"
        fontWeight="600" fill={textFill} fontFamily={FONTS.sans}>{label}</text>
      <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fontSize="7"
        fill={COLORS.mid} fontFamily={FONTS.sans}>{sub}</text>
    </g>
  );
}

const steps = [
  {
    title: 'Step 1: Prompt 输入',
    content: (
      <StepSvg h={160}>
        <LayerBox x={40} y={20} w={130} h={40} label="CLI 解析" sub="ollama run qwen3 ..." side="ollama" />
        <LayerBox x={220} y={20} w={150} h={40} label="构造 HTTP 请求" sub="POST /api/chat" side="ollama" />
        <LayerBox x={420} y={20} w={120} h={40} label="Gin Router" sub="路由到 ChatHandler" side="ollama" />
        {/* arrows */}
        <line x1={170} y1={40} x2={220} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={370} y1={40} x2={420} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <defs>
          <marker id="ij-arr" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
        <text x={W / 2} y={90} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          用户输入「解释量子计算」→ CLI 构造请求 → Server 路由处理
        </text>
        <rect x={180} y={105} width={220} height={18} rx={4}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
        <text x={290} y={117} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          全部在 Ollama (Go) 层
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: 模型加载',
    content: (
      <StepSvg h={160}>
        <LayerBox x={30} y={20} w={120} h={40} label="定位 GGUF" sub="本地 blob 存储" side="ollama" />
        <LayerBox x={190} y={20} w={120} h={40} label="mmap 映射" sub="文件 → 虚拟内存" side="llamacpp" />
        <LayerBox x={350} y={20} w={180} h={40} label="Tensor 分配" sub="按显存预算分 GPU/CPU" side="llamacpp" />
        <line x1={150} y1={40} x2={190} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={310} y1={40} x2={350} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <text x={W / 2} y={90} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Ollama 定位文件 → llama.cpp/GGML 负责 mmap 和 tensor 分配
        </text>
        <rect x={130} y={105} width={100} height={16} rx={3}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
        <text x={180} y={116} textAnchor="middle" fontSize="6.5" fill={COLORS.primary}
          fontFamily={FONTS.sans}>Ollama 侧</text>
        <rect x={270} y={105} width={100} height={16} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.8} />
        <text x={320} y={116} textAnchor="middle" fontSize="6.5" fill={COLORS.orange}
          fontFamily={FONTS.sans}>llama.cpp 侧</text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: Runner 启动',
    content: (
      <StepSvg h={160}>
        <LayerBox x={30} y={20} w={140} h={40} label="启动子进程" sub="ollamarunner / llamarunner" side="ollama" />
        <LayerBox x={220} y={20} w={140} h={40} label="内部 HTTP Server" sub="子进程监听端口" side="both" />
        <LayerBox x={410} y={20} w={140} h={40} label="初始化" sub="构建计算图, 分配 KV Cache" side="llamacpp" />
        <line x1={170} y1={40} x2={220} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={360} y1={40} x2={410} y2={40} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <text x={W / 2} y={95} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          Ollama 主进程 fork runner 子进程 → 子进程初始化推理基础设施
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 4: Prefill 阶段',
    content: (
      <StepSvg h={180}>
        <LayerBox x={20} y={15} w={100} h={35} label="Tokenize" sub="解释量子计算 → IDs" side="both" />
        <LayerBox x={145} y={15} w={90} h={35} label="组装 Batch" sub="N tokens 并行" side="llamacpp" />
        <LayerBox x={260} y={15} w={110} h={35} label="构建计算图" sub="+ 算子融合" side="llamacpp" />
        <LayerBox x={395} y={15} w={140} h={35} label="GPU Forward Pass" sub="所有位置的 logits" side="llamacpp" />
        <line x1={120} y1={32} x2={145} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={235} y1={32} x2={260} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={370} y1={32} x2={395} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <text x={W / 2} y={80} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          所有 prompt token 一次性通过模型 → KV Cache 被填充
        </text>
        {/* Wide batch visual */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={100 + i * 48} y={95} width={40} height={20} rx={3}
            fill="#fef3c7" stroke={COLORS.orange} strokeWidth={0.8} />
        ))}
        <text x={W / 2} y={108} textAnchor="middle" fontSize="7" fill={COLORS.orange}
          fontFamily={FONTS.sans}>并行处理 N 个 token (宽 batch)</text>
        <text x={W / 2} y={140} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.orange} fontFamily={FONTS.sans}>
          Prefill: 计算密集 (compute-bound)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 5: Decode 阶段',
    content: (
      <StepSvg h={180}>
        <LayerBox x={20} y={15} w={110} h={35} label="Sampling" sub="logits → token ID" side="both" />
        <LayerBox x={155} y={15} w={100} h={35} label="Decode Step" sub="batch=1, 新 KV 追加" side="llamacpp" />
        <LayerBox x={280} y={15} w={110} h={35} label="流式输出" sub="HTTP chunked response" side="ollama" />
        <LayerBox x={415} y={15} w={130} h={35} label="循环" sub="直到 EOS 或 max_tokens" side="llamacpp" />
        <line x1={130} y1={32} x2={155} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={255} y1={32} x2={280} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        <line x1={390} y1={32} x2={415} y2={32} stroke="#94a3b8" strokeWidth={1}
          markerEnd="url(#ij-arr)" />
        {/* Narrow batch visual */}
        <rect x={255} y={90} width={50} height={20} rx={3}
          fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
        <text x={280} y={103} textAnchor="middle" fontSize="7" fill={COLORS.primary}
          fontFamily={FONTS.sans}>1 token</text>
        <text x={W / 2} y={135} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          Decode: 带宽密集 (memory-bound), 逐 token 生成
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 6: Prefix Cache 命中',
    content: (
      <StepSvg h={180}>
        {/* First request tokens */}
        <text x={20} y={25} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>请求 1:「解释量子计算」</text>
        {['解释', '量子', '计算'].map((t, i) => (
          <rect key={i} x={20 + i * 65} y={32} width={58} height={22} rx={3}
            fill="#dbeafe" stroke={COLORS.primary} strokeWidth={0.8} />
        ))}
        {['解释', '量子', '计算'].map((t, i) => (
          <text key={`t${i}`} x={49 + i * 65} y={46} textAnchor="middle" fontSize="7"
            fill={COLORS.primary} fontFamily={FONTS.sans}>{t}</text>
        ))}
        <text x={230} y={46} fontSize="7" fill={COLORS.green} fontFamily={FONTS.sans}>
          ✓ KV Cache 已缓存
        </text>

        {/* Second request */}
        <text x={20} y={80} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>请求 2:「解释量子纠缠」</text>
        {['解释', '量子'].map((t, i) => (
          <rect key={i} x={20 + i * 65} y={87} width={58} height={22} rx={3}
            fill="#dcfce7" stroke={COLORS.green} strokeWidth={1.2} />
        ))}
        {['解释', '量子'].map((t, i) => (
          <text key={`t2${i}`} x={49 + i * 65} y={101} textAnchor="middle" fontSize="7"
            fill={COLORS.green} fontFamily={FONTS.sans}>{t} (复用)</text>
        ))}
        <rect x={150} y={87} width={58} height={22} rx={3}
          fill="#fef3c7" stroke={COLORS.orange} strokeWidth={1.2} />
        <text x={179} y={101} textAnchor="middle" fontSize="7"
          fill={COLORS.orange} fontFamily={FONTS.sans}>纠缠 (新)</text>

        <text x={W / 2} y={140} textAnchor="middle" fontSize="8" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          前缀匹配「解释量子」→ 跳过已有 KV → 只 prefill「纠缠」
        </text>
        <text x={W / 2} y={158} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          节省 ~67% prefill 计算量
        </text>
      </StepSvg>
    ),
  },
];

export default function InferenceJourney() {
  return <StepNavigator steps={steps} />;
}
