import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

const SOURCE = ['A', 'B', 'C', 'D'];
const SEP = '|';

export default function CopyTaskComparison() {
  const [mode, setMode] = useState<'transformer' | 'ssm'>('transformer');

  const tokenW = 48;
  const tokenH = 32;
  const seqY = 70;
  const allTokens = [...SOURCE, SEP, ...SOURCE.map(() => '?')];
  const seqX = (W - allTokens.length * tokenW) / 2;

  // SSM accuracy drops with distance
  const ssmAccuracy = SOURCE.map((_, i) => Math.max(0, 1 - i * 0.2));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        Copying Task：Transformer vs SSM
      </text>
      <text x={W / 2} y={40} textAnchor="middle" fontSize="10"
        fill={COLORS.mid} fontFamily={FONTS.sans}>
        任务：将分隔符前的 token 精确复制到后半段
      </text>

      {/* Toggle */}
      {(['transformer', 'ssm'] as const).map((m, i) => (
        <g key={m} onClick={() => setMode(m)} cursor="pointer">
          <rect x={180 + i * 120} y={48} width={110} height={24} rx={12}
            fill={mode === m ? COLORS.primary : COLORS.bgAlt}
            stroke={mode === m ? COLORS.primary : COLORS.light} strokeWidth="1" />
          <text x={235 + i * 120} y={64} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={mode === m ? '#fff' : COLORS.mid} fontFamily={FONTS.sans}>
            {m === 'transformer' ? 'Transformer' : 'SSM'}
          </text>
        </g>
      ))}

      {/* Token sequence */}
      {allTokens.map((tok, i) => {
        const x = seqX + i * tokenW;
        const isSep = tok === SEP;
        const isQuestion = tok === '?';
        const isSource = i < SOURCE.length;
        return (
          <g key={i}>
            <rect x={x + 2} y={seqY} width={tokenW - 4} height={tokenH} rx={5}
              fill={isSep ? COLORS.bgAlt : isSource ? '#e3f2fd' : '#fff3e0'}
              stroke={isSep ? COLORS.mid : isSource ? COLORS.primary : COLORS.orange}
              strokeWidth="1.5" />
            <text x={x + tokenW / 2} y={seqY + 21} textAnchor="middle"
              fontSize="14" fontWeight="600"
              fill={isSep ? COLORS.mid : isSource ? COLORS.primary : COLORS.orange}
              fontFamily={FONTS.mono}>
              {tok}
            </text>
          </g>
        );
      })}

      {mode === 'transformer' ? (
        <g>
          {/* Attention arrows from ? to source tokens */}
          {SOURCE.map((_, i) => {
            const srcX = seqX + i * tokenW + tokenW / 2;
            const tgtX = seqX + (SOURCE.length + 1 + i) * tokenW + tokenW / 2;
            return (
              <g key={`attn-${i}`}>
                <path d={`M ${tgtX} ${seqY + tokenH + 4} Q ${(srcX + tgtX) / 2} ${seqY + tokenH + 50 + i * 10} ${srcX} ${seqY + tokenH + 4}`}
                  fill="none" stroke={COLORS.primary} strokeWidth="1.5"
                  strokeDasharray="4 2" opacity="0.7" />
                <circle cx={srcX} cy={seqY + tokenH + 4} r="3" fill={COLORS.primary} />
              </g>
            );
          })}

          {/* Result tokens */}
          {SOURCE.map((tok, i) => {
            const x = seqX + (SOURCE.length + 1 + i) * tokenW;
            return (
              <text key={`res-${i}`} x={x + tokenW / 2} y={seqY + tokenH + 80}
                textAnchor="middle" fontSize="13" fontWeight="700"
                fill={COLORS.green} fontFamily={FONTS.mono}>
                {tok} ✓
              </text>
            );
          })}

          <text x={W / 2} y={seqY + tokenH + 110} textAnchor="middle" fontSize="11"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            Attention 直接连线到源 token → 精确复制
          </text>

          {/* Accuracy bar */}
          <text x={60} y={280} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>准确率</text>
          <rect x={120} y={268} width={380} height={18} rx={9}
            fill={COLORS.green} opacity="0.9" />
          <text x={310} y={281} textAnchor="middle" fontSize="10"
            fontWeight="700" fill="#fff" fontFamily={FONTS.mono}>100% (任意长度)</text>

          <rect x={60} y={310} width={460} height={60} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={332} textAnchor="middle" fontSize="11"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            Attention 矩阵的每个位置可以直接访问任意历史 token
          </text>
          <text x={290} y={352} textAnchor="middle" fontSize="10"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            Transformer 两层即可 copy 指数长度字符串 (Jelassi et al. 2024)
          </text>
        </g>
      ) : (
        <g>
          {/* State decay visualization */}
          <rect x={100} y={seqY + tokenH + 10} width={380} height={50} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={seqY + tokenH + 30} textAnchor="middle" fontSize="10"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            固定大小状态向量 x ∈ ℝᴺ
          </text>
          <text x={290} y={seqY + tokenH + 48} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            信息经过状态压缩，越早的 token 衰减越多
          </text>

          {/* Result tokens with degradation */}
          {SOURCE.map((tok, i) => {
            const x = seqX + (SOURCE.length + 1 + i) * tokenW;
            const acc = ssmAccuracy[i];
            const correct = acc > 0.5;
            return (
              <g key={`ssm-res-${i}`}>
                <text x={x + tokenW / 2} y={seqY + tokenH + 90}
                  textAnchor="middle" fontSize="13" fontWeight="700"
                  fill={correct ? COLORS.green : COLORS.red} fontFamily={FONTS.mono}>
                  {correct ? tok : '?'} {correct ? '✓' : '✗'}
                </text>
                <text x={x + tokenW / 2} y={seqY + tokenH + 106}
                  textAnchor="middle" fontSize="8"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>
                  {(acc * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          <text x={W / 2} y={seqY + tokenH + 128} textAnchor="middle" fontSize="11"
            fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.sans}>
            SSM 状态压缩 → 远距离 token 信息衰减
          </text>

          {/* Accuracy bars per position */}
          <text x={60} y={268} fontSize="10" fontWeight="600"
            fill={COLORS.mid} fontFamily={FONTS.sans}>准确率</text>
          {SOURCE.map((_, i) => {
            const barW = ssmAccuracy[i] * 380;
            const x = 120;
            const y = 260 + i * 24;
            return (
              <g key={`bar-${i}`}>
                <text x={x - 10} y={y + 13} textAnchor="end" fontSize="9"
                  fill={COLORS.mid} fontFamily={FONTS.mono}>pos {i}</text>
                <rect x={x} y={y} width={380} height={18} rx={9}
                  fill={COLORS.bgAlt} />
                <rect x={x} y={y} width={barW} height={18} rx={9}
                  fill={ssmAccuracy[i] > 0.5 ? COLORS.green : COLORS.red}
                  opacity="0.8" />
                <text x={x + barW + 8} y={y + 13} fontSize="9"
                  fontWeight="600" fill={COLORS.dark} fontFamily={FONTS.mono}>
                  {(ssmAccuracy[i] * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          <rect x={60} y={362} width={460} height={40} rx={6}
            fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1" />
          <text x={290} y={380} textAnchor="middle" fontSize="10"
            fill={COLORS.dark} fontFamily={FONTS.sans}>
            N 维状态无法精确存储 M 个 token (M &gt;&gt; N)：信息必然丢失
          </text>
          <text x={290} y={394} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            序列越长，准确率下降越明显 — SSM 的根本局限
          </text>
        </g>
      )}
    </svg>
  );
}
