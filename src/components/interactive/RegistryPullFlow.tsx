import StepNavigator from '../primitives/StepNavigator';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

function StepSvg({ children, h }: { children: React.ReactNode; h: number }) {
  return <svg viewBox={`0 0 ${W} ${h}`} className="w-full">{children}</svg>;
}

function Box({ x, y, w, h, label, sub, color }: {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; color: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={color === COLORS.primary ? '#dbeafe' : '#f1f5f9'}
        stroke={color} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 2 : h / 2 + 4)} textAnchor="middle"
        fontSize="7.5" fontWeight="600" fill={color} fontFamily={FONTS.sans}>{label}</text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle"
          fontSize="6.5" fill={COLORS.mid} fontFamily={FONTS.sans}>{sub}</text>
      )}
    </g>
  );
}

const steps = [
  {
    title: 'Step 1: 解析模型名',
    content: (
      <StepSvg h={120}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>ollama pull qwen3</text>
        <Box x={20} y={35} w={120} h={35} label="qwen3" sub="= library/qwen3:latest" color={COLORS.primary} />
        <text x={160} y={55} fontSize="16" fill="#94a3b8">→</text>
        <Box x={180} y={35} w={150} h={35} label="Registry API 请求" sub="GET /v2/library/qwen3/manifests/latest" color={COLORS.primary} />
        <text x={W / 2} y={95} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          模型名格式: namespace/model:tag (类似 Docker image 命名)
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 2: 获取 Manifest',
    content: (
      <StepSvg h={140}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>Manifest 内容:</text>
        {[
          { label: 'GGUF 权重', size: '2.6 GB', color: COLORS.orange },
          { label: 'Tokenizer', size: '4.2 MB', color: COLORS.primary },
          { label: 'Chat Template', size: '1.2 KB', color: COLORS.green },
          { label: 'License', size: '2.1 KB', color: '#94a3b8' },
        ].map((layer, i) => (
          <g key={i}>
            <rect x={20} y={30 + i * 24} width={W - 40} height={20} rx={3}
              fill="#f8fafc" stroke="#e2e8f0" strokeWidth={0.5} />
            <circle cx={35} cy={40 + i * 24} r={4} fill={layer.color} />
            <text x={50} y={44 + i * 24} fontSize="7.5" fill={COLORS.dark}
              fontFamily={FONTS.sans}>{layer.label}</text>
            <text x={W - 30} y={44 + i * 24} textAnchor="end" fontSize="7"
              fill={COLORS.mid} fontFamily={FONTS.mono}>{layer.size}</text>
          </g>
        ))}
        <text x={W / 2} y={130} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          每个 layer 有 SHA256 digest → content-addressable 存储
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 3: 检查本地 Blob 缓存',
    content: (
      <StepSvg h={130}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>本地缓存检查:</text>
        {[
          { label: 'GGUF 权重', status: '缺失 → 需下载', color: COLORS.red },
          { label: 'Tokenizer', status: '✓ 已有 (与 qwen3-4B 共享)', color: COLORS.green },
          { label: 'Chat Template', status: '✓ 已有 (与 qwen3-4B 共享)', color: COLORS.green },
          { label: 'License', status: '✓ 已有 (通用 Apache 2.0)', color: COLORS.green },
        ].map((item, i) => (
          <g key={i}>
            <text x={30} y={42 + i * 20} fontSize="7.5" fill={COLORS.dark}
              fontFamily={FONTS.sans}>{item.label}</text>
            <text x={200} y={42 + i * 20} fontSize="7" fill={item.color}
              fontFamily={FONTS.sans}>{item.status}</text>
          </g>
        ))}
        <rect x={100} y={110} width={380} height={16} rx={3}
          fill="#f0fdf4" stroke={COLORS.green} strokeWidth={0.8} />
        <text x={290} y={121} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.green} fontFamily={FONTS.sans}>
          Layer 去重: 仅下载 GGUF 权重, 节省 ~4.2 MB
        </text>
      </StepSvg>
    ),
  },
  {
    title: 'Step 4: 下载并验证',
    content: (
      <StepSvg h={120}>
        <text x={20} y={20} fontSize="8" fontWeight="600" fill={COLORS.dark}
          fontFamily={FONTS.sans}>下载缺失 layer → 存入本地 blob store</text>
        <rect x={20} y={35} width={W - 40} height={20} rx={10}
          fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={1} />
        <rect x={20} y={35} width={(W - 40) * 0.75} height={20} rx={10}
          fill={COLORS.primary} opacity={0.3} />
        <text x={W / 2} y={49} textAnchor="middle" fontSize="7" fontWeight="600"
          fill={COLORS.primary} fontFamily={FONTS.sans}>
          下载中: 2.6 GB (75%)
        </text>
        <text x={W / 2} y={80} textAnchor="middle" fontSize="7" fill={COLORS.mid}
          fontFamily={FONTS.sans}>
          下载完成 → 验证 SHA256 → 写入 blob 目录 → 更新本地 manifest
        </text>
        <text x={W / 2} y={100} textAnchor="middle" fontSize="7" fill={COLORS.green}
          fontFamily={FONTS.sans}>
          ✓ qwen3:latest 可用
        </text>
      </StepSvg>
    ),
  },
];

export default function RegistryPullFlow() {
  return <StepNavigator steps={steps} />;
}
