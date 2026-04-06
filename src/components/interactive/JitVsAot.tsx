import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const JitVsAot: React.FC = () => {
  const [mode, setMode] = useState<'jit' | 'aot'>('jit');

  const dimensions = [
    {
      label: '编译时机',
      jit: { text: '运行时 (Runtime)', color: COLORS.orange },
      aot: { text: '构建时 (Build-time)', color: COLORS.green },
    },
    {
      label: '启动延迟',
      jit: { text: '高 (首次需编译)', color: COLORS.red },
      aot: { text: '低 (预编译完成)', color: COLORS.green },
    },
    {
      label: '优化程度',
      jit: { text: '高 (运行时信息)', color: COLORS.green },
      aot: { text: '中 (静态分析)', color: COLORS.orange },
    },
    {
      label: '二进制大小',
      jit: { text: '小 (SPIR-V)', color: COLORS.green },
      aot: { text: '大 (多目标 ISA)', color: COLORS.orange },
    },
    {
      label: '典型使用者',
      jit: { text: 'oneDNN, SYCL runtime', color: COLORS.primary },
      aot: { text: 'OpenVINO model cache', color: COLORS.purple },
    },
  ];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <svg viewBox="0 0 580 340" className="w-full">
        {/* Title */}
        <text x="290" y="25" fontFamily={FONTS.sans} fontSize="14" fill={COLORS.dark} fontWeight="700" textAnchor="middle">
          JIT vs AOT 编译策略
        </text>

        {/* Toggle buttons */}
        <g onClick={() => setMode('jit')} style={{ cursor: 'pointer' }}>
          <rect
            x="180"
            y="40"
            width="100"
            height="30"
            fill={mode === 'jit' ? COLORS.primary : COLORS.light}
            stroke={COLORS.primary}
            strokeWidth={mode === 'jit' ? '2' : '1'}
            rx="4"
          />
          <text
            x="230"
            y="61"
            fontFamily={FONTS.sans}
            fontSize="12"
            fill={mode === 'jit' ? COLORS.bg : COLORS.mid}
            fontWeight={mode === 'jit' ? '700' : '400'}
            textAnchor="middle"
          >
            JIT
          </text>
        </g>

        <g onClick={() => setMode('aot')} style={{ cursor: 'pointer' }}>
          <rect
            x="300"
            y="40"
            width="100"
            height="30"
            fill={mode === 'aot' ? COLORS.primary : COLORS.light}
            stroke={COLORS.primary}
            strokeWidth={mode === 'aot' ? '2' : '1'}
            rx="4"
          />
          <text
            x="350"
            y="61"
            fontFamily={FONTS.sans}
            fontSize="12"
            fill={mode === 'aot' ? COLORS.bg : COLORS.mid}
            fontWeight={mode === 'aot' ? '700' : '400'}
            textAnchor="middle"
          >
            AOT
          </text>
        </g>

        {/* Comparison dimensions */}
        {dimensions.map((dim, i) => {
          const y = 100 + i * 45;
          const current = mode === 'jit' ? dim.jit : dim.aot;
          const other = mode === 'jit' ? dim.aot : dim.jit;

          return (
            <g key={i}>
              {/* Label */}
              <text x="40" y={y + 5} fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} fontWeight="600">
                {dim.label}
              </text>

              {/* Active bar */}
              <rect
                x="150"
                y={y - 12}
                width="200"
                height="26"
                fill={current.color}
                opacity="0.2"
                stroke={current.color}
                strokeWidth="2"
                rx="4"
              />
              <text x="250" y={y + 5} fontFamily={FONTS.sans} fontSize="11" fill={COLORS.dark} textAnchor="middle" fontWeight="600">
                {current.text}
              </text>

              {/* Inactive bar (ghost) */}
              <rect
                x="370"
                y={y - 12}
                width="180"
                height="26"
                fill={other.color}
                opacity="0.08"
                stroke={other.color}
                strokeWidth="1"
                strokeDasharray="3 2"
                rx="4"
              />
              <text x="460" y={y + 5} fontFamily={FONTS.sans} fontSize="10" fill={COLORS.mid} textAnchor="middle" opacity="0.6">
                {other.text}
              </text>
            </g>
          );
        })}

        {/* Bottom explanation */}
        <rect x="30" y="315" width="520" height="18" fill={mode === 'jit' ? COLORS.orange : COLORS.green} opacity="0.15" rx="3" />
        <text x="290" y="327" fontFamily={FONTS.sans} fontSize="10" fill={COLORS.dark} textAnchor="middle">
          {mode === 'jit'
            ? 'JIT: SPIR-V → IGC 运行时编译，灵活但有启动延迟，适合通用库'
            : 'AOT: 离线预编译多架构 ISA，启动快但体积大，适合推理部署'}
        </text>
      </svg>
    </div>
  );
};

export default JitVsAot;
