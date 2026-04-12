import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

interface Props {
  locale?: 'zh' | 'en';
}

const W = 800, H = 400;

type Issue = 'flicker' | 'morph' | 'disappear';

export default function VideoConsistencyChallenge({ locale = 'zh' }: Props) {
  const [selectedIssue, setSelectedIssue] = useState<Issue>('flicker');

  const t = {
    zh: {
      title: '视频时间一致性挑战',
      flicker: '颜色闪烁',
      morph: '形态变化',
      disappear: '物体消失',
      flickerDesc: '逐帧独立生成时，同一物体的颜色在帧之间随机变化。解决方案：时间注意力让模型"看到"前后帧的颜色。',
      morphDesc: '物体的形状在帧之间不连续变化（如方形变圆形）。解决方案：时空 patch 编码保持局部结构的跨帧一致性。',
      disappearDesc: '物体在某些帧中突然消失又出现。解决方案：长程时间依赖建模 + 运动一致性约束。',
      frame: '帧',
      issue: '问题',
      solution: '解决方案',
    },
    en: {
      title: 'Temporal Consistency Challenges',
      flicker: 'Color Flickering',
      morph: 'Shape Morphing',
      disappear: 'Object Vanishing',
      flickerDesc: 'When generating frames independently, an object\'s color changes randomly between frames. Solution: temporal attention lets the model "see" colors in neighboring frames.',
      morphDesc: 'Object shapes change discontinuously between frames (e.g., square to circle). Solution: spatiotemporal patch encoding preserves local structure across frames.',
      disappearDesc: 'Objects suddenly vanish and reappear in certain frames. Solution: long-range temporal dependency modeling + motion consistency constraints.',
      frame: 'Frame',
      issue: 'Problem',
      solution: 'Solution',
    },
  }[locale]!;

  const frameW = 140, frameH = 120;
  const frameY = 90;
  const numFrames = 4;
  const frameStartX = (W - numFrames * frameW - (numFrames - 1) * 20) / 2;

  const flickerColors = ['#ef4444', '#3b82f6', '#ef4444', '#22c55e'];
  const morphShapes = ['rect', 'roundRect', 'ellipse', 'rect'] as const;

  const descriptions: Record<Issue, string> = {
    flicker: t.flickerDesc,
    morph: t.morphDesc,
    disappear: t.disappearDesc,
  };

  const issueColors: Record<Issue, string> = {
    flicker: COLORS.red,
    morph: COLORS.orange,
    disappear: COLORS.purple,
  };

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W }}>
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={28} textAnchor="middle" fontSize="15" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>

        {/* Issue selector buttons */}
        {([
          { key: 'flicker' as Issue, label: t.flicker },
          { key: 'morph' as Issue, label: t.morph },
          { key: 'disappear' as Issue, label: t.disappear },
        ]).map((btn, i) => (
          <g key={btn.key} onClick={() => setSelectedIssue(btn.key)} style={{ cursor: 'pointer' }}>
            <rect x={180 + i * 160} y={42} width={140} height={28} rx={14}
              fill={selectedIssue === btn.key ? issueColors[btn.key] : COLORS.bg}
              stroke={issueColors[btn.key]} strokeWidth={1.5} />
            <text x={250 + i * 160} y={60} textAnchor="middle"
              fontSize="11" fontWeight="600"
              fill={selectedIssue === btn.key ? COLORS.bg : issueColors[btn.key]}>
              {btn.label}
            </text>
          </g>
        ))}

        {/* Frames */}
        {Array.from({ length: numFrames }, (_, fi) => {
          const fx = frameStartX + fi * (frameW + 20);
          const cx = fx + frameW / 2;
          const cy = frameY + frameH / 2;

          return (
            <g key={fi}>
              {/* Frame border */}
              <rect x={fx} y={frameY} width={frameW} height={frameH} rx={8}
                fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth={1.5} />

              {/* Frame label */}
              <text x={cx} y={frameY + frameH + 18} textAnchor="middle"
                fontSize="10" fontWeight="500" fill={COLORS.mid}>
                {t.frame} {fi}
              </text>

              {/* Content based on selected issue */}
              {selectedIssue === 'flicker' && (
                <motion.g
                  key={`flicker-${fi}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: fi * 0.1 }}
                >
                  {/* Same shaped object with different colors */}
                  <motion.rect
                    x={cx - 25} y={cy - 20} width={50} height={40} rx={6}
                    fill={flickerColors[fi]}
                    animate={{
                      fill: flickerColors[fi],
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Small consistent shape for reference */}
                  <circle cx={cx + 35} cy={cy - 25} r={8}
                    fill={COLORS.mid} opacity={0.3} />

                  {/* Warning indicator for color change */}
                  {fi > 0 && flickerColors[fi] !== flickerColors[fi - 1] && (
                    <motion.text
                      x={cx} y={cy + 35} textAnchor="middle" fontSize="14"
                      fill={COLORS.red} fontWeight="700"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      !
                    </motion.text>
                  )}
                </motion.g>
              )}

              {selectedIssue === 'morph' && (
                <motion.g
                  key={`morph-${fi}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: fi * 0.1 }}
                >
                  {morphShapes[fi] === 'rect' && (
                    <rect x={cx - 22} y={cy - 22} width={44} height={44} rx={2}
                      fill={COLORS.primary} opacity={0.7} />
                  )}
                  {morphShapes[fi] === 'roundRect' && (
                    <rect x={cx - 22} y={cy - 22} width={44} height={44} rx={14}
                      fill={COLORS.primary} opacity={0.7} />
                  )}
                  {morphShapes[fi] === 'ellipse' && (
                    <ellipse cx={cx} cy={cy} rx={26} ry={18}
                      fill={COLORS.primary} opacity={0.7} />
                  )}

                  {/* Warning for shape change */}
                  {fi > 0 && morphShapes[fi] !== morphShapes[fi - 1] && (
                    <motion.text
                      x={cx} y={cy + 40} textAnchor="middle" fontSize="14"
                      fill={COLORS.orange} fontWeight="700"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      !
                    </motion.text>
                  )}
                </motion.g>
              )}

              {selectedIssue === 'disappear' && (
                <motion.g
                  key={`disappear-${fi}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: fi * 0.1 }}
                >
                  {/* Object present in frames 0, 1, 3 but missing in frame 2 */}
                  {fi !== 2 ? (
                    <g>
                      <rect x={cx - 20} y={cy - 15} width={40} height={30} rx={4}
                        fill={COLORS.green} opacity={0.7} />
                      <circle cx={cx - 30} cy={cy + 20} r={6}
                        fill={COLORS.purple} opacity={0.5} />
                    </g>
                  ) : (
                    <g>
                      {/* Empty space with dashed outline */}
                      <rect x={cx - 20} y={cy - 15} width={40} height={30} rx={4}
                        fill="none" stroke={COLORS.red} strokeWidth={1.5}
                        strokeDasharray="4 2" opacity={0.5} />
                      <text x={cx} y={cy + 5} textAnchor="middle"
                        fontSize="18" fill={COLORS.red} opacity={0.6}>
                        ?
                      </text>
                      {/* Other object still there */}
                      <circle cx={cx - 30} cy={cy + 20} r={6}
                        fill={COLORS.purple} opacity={0.5} />
                    </g>
                  )}

                  {fi === 2 && (
                    <motion.text
                      x={cx} y={cy + 40} textAnchor="middle" fontSize="14"
                      fill={COLORS.purple} fontWeight="700"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      !
                    </motion.text>
                  )}
                </motion.g>
              )}
            </g>
          );
        })}

        {/* Description */}
        <motion.g
          key={selectedIssue}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <rect x={40} y={H - 85} width={W - 80} height={70} rx={8}
            fill={COLORS.bgAlt} stroke={issueColors[selectedIssue]} strokeWidth={1} strokeOpacity={0.3} />

          <text x={60} y={H - 60} fontSize="11" fontWeight="700" fill={issueColors[selectedIssue]}>
            {t.issue}:
          </text>
          <text x={60} y={H - 42} fontSize="10" fill={COLORS.dark}>
            {descriptions[selectedIssue].split('。')[0]}。
          </text>
          <text x={60} y={H - 25} fontSize="10" fontWeight="500" fill={COLORS.green}>
            {descriptions[selectedIssue].split(/\.|\./).filter(s => s.includes(locale === 'zh' ? '解决' : 'olution'))[0]?.trim() || ''}
          </text>
        </motion.g>
      </svg>
    </div>
  );
}
