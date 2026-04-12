import React, { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 300;

interface Milestone {
  date: string;
  label: string;
  org: string;
  desc: string;
  tech: string;
  color: string;
  approach: string;
}

export default function MusicGenTimeline({ locale = 'zh' }: Props) {
  const milestones: Milestone[] = locale === 'zh' ? [
    { date: '2020-04', label: 'Jukebox', org: 'OpenAI', desc: 'VQ-VAE + Transformer 直接建模原始音频', tech: 'VQ-VAE 多尺度, 自回归', color: COLORS.primary, approach: 'AR' },
    { date: '2023-01', label: 'MusicLM', org: 'Google', desc: 'MuLan 音乐-文本对齐 + SoundStream 层级生成', tech: 'MuLan + SoundStream, 层级式', color: COLORS.green, approach: 'AR' },
    { date: '2023-06', label: 'MusicGen', org: 'Meta', desc: '单阶段 Transformer + Delay Pattern, 高效可控', tech: '单 Transformer + Delay Pattern', color: COLORS.orange, approach: 'AR' },
    { date: '2024-01', label: 'Stable Audio', org: 'Stability AI', desc: '潜在扩散模型用于音乐, 支持时长控制', tech: 'Latent Diffusion, 时长条件', color: COLORS.purple, approach: 'Diffusion' },
    { date: '2024+', label: 'Udio / Suno', org: '商业', desc: '商业化音乐 AI, 接近专业水平', tech: '商业系统 (细节未公开)', color: COLORS.red, approach: '商业' },
  ] : [
    { date: '2020-04', label: 'Jukebox', org: 'OpenAI', desc: 'VQ-VAE + Transformer modeling raw audio directly', tech: 'Multi-scale VQ-VAE, autoregressive', color: COLORS.primary, approach: 'AR' },
    { date: '2023-01', label: 'MusicLM', org: 'Google', desc: 'MuLan music-text alignment + SoundStream hierarchical generation', tech: 'MuLan + SoundStream, hierarchical', color: COLORS.green, approach: 'AR' },
    { date: '2023-06', label: 'MusicGen', org: 'Meta', desc: 'Single-stage Transformer + Delay Pattern, efficient and controllable', tech: 'Single Transformer + Delay Pattern', color: COLORS.orange, approach: 'AR' },
    { date: '2024-01', label: 'Stable Audio', org: 'Stability AI', desc: 'Latent diffusion for music, timing-conditioned generation', tech: 'Latent Diffusion, timing-conditioned', color: COLORS.purple, approach: 'Diffusion' },
    { date: '2024+', label: 'Udio / Suno', org: 'Commercial', desc: 'Commercial music AI, approaching professional quality', tech: 'Commercial systems (undisclosed)', color: COLORS.red, approach: 'Commercial' },
  ];

  const tt = {
    zh: {
      title: '音乐生成模型演进',
      arLabel: '自回归 (AR)',
      diffLabel: '扩散 (Diffusion)',
      commLabel: '商业',
      hover: '悬停查看详情',
    },
    en: {
      title: 'Music Generation Model Evolution',
      arLabel: 'Autoregressive (AR)',
      diffLabel: 'Diffusion',
      commLabel: 'Commercial',
      hover: 'Hover for details',
    },
  }[locale]!;

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const timelineY = 110;
  const startX = 80, endX = W - 80;
  const span = endX - startX;

  // Position milestones evenly
  const positions = milestones.map((_, i) => startX + (i / (milestones.length - 1)) * span);

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700"
          fill={COLORS.dark}>{tt.title}</text>

        {/* Legend */}
        <g transform="translate(200, 40)">
          {[
            { label: tt.arLabel, color: COLORS.primary },
            { label: tt.diffLabel, color: COLORS.purple },
            { label: tt.commLabel, color: COLORS.red },
          ].map((item, i) => (
            <g key={i} transform={`translate(${i * 150}, 0)`}>
              <rect x={0} y={0} width={12} height={12} rx={2} fill={item.color} opacity={0.7} />
              <text x={18} y={10} fontSize="9" fill={COLORS.dark}>{item.label}</text>
            </g>
          ))}
        </g>

        {/* Timeline axis */}
        <line x1={startX - 20} y1={timelineY} x2={endX + 20} y2={timelineY}
          stroke={COLORS.light} strokeWidth={3} strokeLinecap="round" />

        {/* Milestones */}
        {milestones.map((ms, i) => {
          const cx = positions[i];
          const isHovered = hoveredIdx === i;
          const above = i % 2 === 0;

          return (
            <g key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}>

              {/* Connector line */}
              <line x1={cx} y1={timelineY - (above ? 30 : -10)}
                x2={cx} y2={timelineY + (above ? -10 : 30)}
                stroke={ms.color} strokeWidth={1} opacity={0.5} />

              {/* Dot on timeline */}
              <circle cx={cx} cy={timelineY} r={isHovered ? 8 : 6}
                fill={ms.color} stroke={COLORS.bg} strokeWidth={2} />

              {/* Date label */}
              <text x={cx} y={timelineY + (above ? -36 : 50)}
                textAnchor="middle" fontSize="9" fontWeight="600"
                fill={ms.color} fontFamily={FONTS.mono}>
                {ms.date}
              </text>

              {/* Name label */}
              <text x={cx} y={timelineY + (above ? -48 : 64)}
                textAnchor="middle" fontSize="11" fontWeight={isHovered ? 700 : 600}
                fill={isHovered ? ms.color : COLORS.dark}>
                {ms.label}
              </text>

              {/* Org label */}
              <text x={cx} y={timelineY + (above ? -60 : 78)}
                textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                {ms.org}
              </text>
            </g>
          );
        })}

        {/* Detail panel */}
        {hoveredIdx !== null && (
          <g>
            <rect x={W / 2 - 180} y={180} width={360} height={55} rx={8}
              fill={COLORS.bgAlt} stroke={milestones[hoveredIdx].color} strokeWidth={1.5} />
            <text x={W / 2 - 165} y={200} fontSize="11" fontWeight="700"
              fill={milestones[hoveredIdx].color}>
              {milestones[hoveredIdx].label} ({milestones[hoveredIdx].date})
            </text>
            <text x={W / 2 - 165} y={216} fontSize="9" fill={COLORS.dark}>
              {milestones[hoveredIdx].desc}
            </text>
            <text x={W / 2 - 165} y={230} fontSize="8" fill={COLORS.mid}>
              {milestones[hoveredIdx].tech}
            </text>
          </g>
        )}

        {hoveredIdx === null && (
          <text x={W / 2} y={H - 20} textAnchor="middle" fontSize="9" fill={COLORS.mid}>
            {tt.hover}
          </text>
        )}
      </svg>
    </div>
  );
}
