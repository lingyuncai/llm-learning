import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 300;

interface Milestone {
  date: string;
  label: string;
  desc: string;
  backbone: 'unet' | 'dit';
}

export default function VideoGenTimeline({ locale = 'zh' }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const t = {
    zh: {
      title: '视频生成发展里程碑',
      unet: 'U-Net 骨干',
      dit: 'DiT 骨干',
      milestones: [
        { date: '2022-09', label: 'Make-A-Video', desc: 'Meta 提出文本到视频生成，利用图像-文本对 + 无标签视频', backbone: 'unet' as const },
        { date: '2023-04', label: 'Gen-1 (Runway)', desc: 'Runway 推出首个商用视频编辑模型，支持文本/图像引导', backbone: 'unet' as const },
        { date: '2023-06', label: 'VideoLDM', desc: '将 Latent Diffusion 扩展到视频，引入时间层', backbone: 'unet' as const },
        { date: '2023-11', label: 'Gen-2 (Runway)', desc: 'Runway 第二代，支持纯文本生成 4 秒视频', backbone: 'unet' as const },
        { date: '2024-02', label: 'Sora (OpenAI)', desc: 'DiT 架构，分钟级长度，可变分辨率/宽高比', backbone: 'dit' as const },
        { date: '2024-06', label: 'Gen-3 Alpha', desc: 'Runway 第三代，DiT 架构，大幅提升质量', backbone: 'dit' as const },
        { date: '2024-12', label: 'Sora 公开发布', desc: 'Sora 面向公众开放，支持多种创作功能', backbone: 'dit' as const },
      ] as Milestone[],
    },
    en: {
      title: 'Video Generation Milestones',
      unet: 'U-Net backbone',
      dit: 'DiT backbone',
      milestones: [
        { date: '2022-09', label: 'Make-A-Video', desc: 'Meta: text-to-video using image-text pairs + unlabeled video', backbone: 'unet' as const },
        { date: '2023-04', label: 'Gen-1 (Runway)', desc: 'Runway: first commercial video editing model, text/image guided', backbone: 'unet' as const },
        { date: '2023-06', label: 'VideoLDM', desc: 'Extended Latent Diffusion to video with temporal layers', backbone: 'unet' as const },
        { date: '2023-11', label: 'Gen-2 (Runway)', desc: 'Runway 2nd gen: text-only generation of 4-second clips', backbone: 'unet' as const },
        { date: '2024-02', label: 'Sora (OpenAI)', desc: 'DiT architecture, minute-long videos, variable resolution/aspect', backbone: 'dit' as const },
        { date: '2024-06', label: 'Gen-3 Alpha', desc: 'Runway 3rd gen: DiT architecture, major quality leap', backbone: 'dit' as const },
        { date: '2024-12', label: 'Sora Public', desc: 'Sora released publicly with diverse creative features', backbone: 'dit' as const },
      ] as Milestone[],
    },
  }[locale]!;

  const milestones = t.milestones;
  const timelineY = 140;
  const leftPad = 60, rightPad = 60;
  const trackW = W - leftPad - rightPad;

  const getX = (idx: number) => leftPad + (idx / (milestones.length - 1)) * trackW;

  const backboneColors = {
    unet: COLORS.orange,
    dit: COLORS.purple,
  };

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }}>
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={25} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Legend */}
        <circle cx={250} cy={45} r={6} fill={COLORS.orange} />
        <text x={262} y={49} fontSize="10" fill={COLORS.mid}>{t.unet}</text>
        <circle cx={380} cy={45} r={6} fill={COLORS.purple} />
        <text x={392} y={49} fontSize="10" fill={COLORS.mid}>{t.dit}</text>

        {/* Timeline track */}
        <line x1={leftPad} y1={timelineY} x2={W - rightPad} y2={timelineY}
          stroke={COLORS.light} strokeWidth={3} />

        {/* Transition marker — where U-Net ends and DiT begins */}
        {(() => {
          const transIdx = milestones.findIndex(m => m.backbone === 'dit');
          if (transIdx > 0) {
            const tx = (getX(transIdx - 1) + getX(transIdx)) / 2;
            return (
              <g>
                <line x1={tx} y1={timelineY - 20} x2={tx} y2={timelineY + 20}
                  stroke={COLORS.mid} strokeWidth={1} strokeDasharray="3 2" />
              </g>
            );
          }
          return null;
        })()}

        {/* Colored track segments */}
        {milestones.slice(0, -1).map((m, i) => (
          <line
            key={`seg-${i}`}
            x1={getX(i)} y1={timelineY}
            x2={getX(i + 1)} y2={timelineY}
            stroke={backboneColors[m.backbone]}
            strokeWidth={3}
            opacity={0.5}
          />
        ))}

        {/* Milestone dots and labels */}
        {milestones.map((m, i) => {
          const x = getX(i);
          const isAbove = i % 2 === 0;
          const labelY = isAbove ? timelineY - 35 : timelineY + 50;
          const dateY = isAbove ? timelineY - 22 : timelineY + 35;
          const lineY1 = isAbove ? timelineY - 18 : timelineY + 6;
          const lineY2 = isAbove ? timelineY - 6 : timelineY + 18;
          const isHovered = hovered === i;
          const color = backboneColors[m.backbone];

          return (
            <g key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Connector line */}
              <line x1={x} y1={lineY1} x2={x} y2={lineY2}
                stroke={color} strokeWidth={1} opacity={0.5} />

              {/* Dot */}
              <motion.circle
                cx={x} cy={timelineY} r={isHovered ? 8 : 6}
                fill={color}
                animate={{ r: isHovered ? 8 : 6 }}
                transition={{ duration: 0.2 }}
              />

              {/* Label */}
              <text x={x} y={labelY} textAnchor="middle"
                fontSize={isHovered ? '11' : '9'} fontWeight={isHovered ? '700' : '600'}
                fill={color}>
                {m.label}
              </text>

              {/* Date */}
              <text x={x} y={dateY} textAnchor="middle" fontSize="8" fill={COLORS.mid}>
                {m.date}
              </text>
            </g>
          );
        })}

        {/* Hover detail panel */}
        {hovered !== null && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <rect x={W / 2 - 200} y={H - 60} width={400} height={36} rx={6}
              fill={COLORS.bgAlt} stroke={backboneColors[milestones[hovered].backbone]}
              strokeWidth={1} />
            <text x={W / 2} y={H - 38} textAnchor="middle" fontSize="11" fill={COLORS.dark}>
              {milestones[hovered].desc}
            </text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
