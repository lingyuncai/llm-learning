import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS, FONTS } from './shared/colors';

/* ─── Types ─── */

interface CodeLine {
  text: string;
  variable?: string;
  version?: number;
  isPhi?: boolean;
  phiSources?: string[];
  indent?: number;
}

interface Props {
  locale?: 'zh' | 'en';
}

/* ─── Data ─── */

const VERSION_COLORS = [
  COLORS.primary,   // v0 — blue
  COLORS.green,     // v1 — green
  COLORS.orange,    // v2 — orange
  COLORS.purple,    // v3 — purple (phi)
];

const NON_SSA: CodeLine[] = [
  { text: 'x = input', variable: 'x' },
  { text: 'if condition:' },
  { text: 'x = x + 1', variable: 'x', indent: 1 },
  { text: 'else:' },
  { text: 'x = x * 2', variable: 'x', indent: 1 },
  { text: 'return x' },
];

const SSA: CodeLine[] = [
  { text: 'x\u2080 = input', variable: 'x', version: 0 },
  { text: 'if condition:' },
  { text: 'x\u2081 = x\u2080 + 1', variable: 'x', version: 1, indent: 1 },
  { text: 'else:' },
  { text: 'x\u2082 = x\u2080 * 2', variable: 'x', version: 2, indent: 1 },
  { text: 'x\u2083 = \u03c6(x\u2081, x\u2082)', variable: 'x', version: 3, isPhi: true, phiSources: ['x\u2081 (if-branch)', 'x\u2082 (else-branch)'] },
  { text: 'return x\u2083' },
];

/* ─── SVG Constants ─── */

const W = 800;
const H = 450;
const PANEL_W = 350;
const PANEL_LEFT = 30;
const PANEL_RIGHT = W - PANEL_W - 30;
const CODE_TOP = 100;
const LINE_H = 38;

/* ─── Component ─── */

export default function SSAVisualizer({ locale = 'zh' }: Props) {
  const [hoveredVersion, setHoveredVersion] = useState<number | null>(null);
  const [showPhiDetail, setShowPhiDetail] = useState(false);

  const t = {
    zh: {
      title: 'SSA 转换：单赋值形式与 \u03c6 节点',
      before: '转换前（非 SSA）',
      after: '转换后（SSA 形式）',
      problem: '问题：同一变量 x 被多次赋值，编译器难以追踪哪次赋值对应哪次使用',
      solution: '解决：每次赋值产生唯一版本号，\u03c6 节点在控制流汇合点合并分支',
      phiExplain: '\u03c6 节点根据控制流选择来源：',
      phiFrom: '来自',
      hoverHint: '悬停变量查看版本追踪',
      varX: '变量 x',
      reassigned: '被重复赋值',
      unique: '每个版本唯一',
    },
    en: {
      title: 'SSA Conversion: Static Single Assignment & \u03c6 Nodes',
      before: 'Before (Non-SSA)',
      after: 'After (SSA Form)',
      problem: 'Problem: variable x is reassigned multiple times, making it hard to track definitions and uses',
      solution: 'Solution: each assignment produces a unique version; \u03c6 nodes merge branches at join points',
      phiExplain: '\u03c6 node selects source based on control flow:',
      phiFrom: 'from',
      hoverHint: 'Hover over variables to track versions',
      varX: 'Variable x',
      reassigned: 'reassigned',
      unique: 'unique per version',
    },
  }[locale]!;

  function renderCodePanel(
    lines: CodeLine[],
    panelX: number,
    isSSA: boolean,
    label: string,
    labelColor: string
  ) {
    const panelH = Math.max(lines.length * LINE_H + 30, 250);
    return (
      <g>
        {/* Panel background */}
        <rect
          x={panelX}
          y={CODE_TOP - 30}
          width={PANEL_W}
          height={panelH}
          rx={8}
          fill="#1e1e2e"
          stroke={labelColor}
          strokeWidth={1.5}
          strokeOpacity={0.4}
        />

        {/* Panel label */}
        <rect
          x={panelX}
          y={CODE_TOP - 30}
          width={PANEL_W}
          height={28}
          rx={8}
          fill={labelColor}
          fillOpacity={0.15}
        />
        {/* Bottom corners over the rounded rect */}
        <rect
          x={panelX}
          y={CODE_TOP - 16}
          width={PANEL_W}
          height={14}
          fill={labelColor}
          fillOpacity={0.15}
        />
        <text
          x={panelX + PANEL_W / 2}
          y={CODE_TOP - 12}
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={labelColor}
        >
          {label}
        </text>

        {/* Code lines */}
        {lines.map((line, idx) => {
          const lineY = CODE_TOP + 14 + idx * LINE_H;
          const indent = (line.indent ?? 0) * 20;
          const hasVersion = line.version !== undefined;
          const versionColor = hasVersion ? VERSION_COLORS[line.version!] ?? COLORS.mid : undefined;
          const isHovered = hasVersion && hoveredVersion === line.version;
          const isPhi = line.isPhi;

          return (
            <g
              key={idx}
              onMouseEnter={() => hasVersion ? setHoveredVersion(line.version!) : undefined}
              onMouseLeave={() => setHoveredVersion(null)}
              onClick={() => isPhi ? setShowPhiDetail(!showPhiDetail) : undefined}
              style={{ cursor: hasVersion || isPhi ? 'pointer' : 'default' }}
            >
              {/* Line highlight */}
              {(isHovered || (isPhi && showPhiDetail)) && (
                <rect
                  x={panelX + 4}
                  y={lineY - 13}
                  width={PANEL_W - 8}
                  height={LINE_H - 4}
                  rx={4}
                  fill={versionColor ?? COLORS.purple}
                  fillOpacity={0.15}
                />
              )}

              {/* Phi icon */}
              {isPhi && (
                <g>
                  <circle
                    cx={panelX + 18 + indent}
                    cy={lineY}
                    r={10}
                    fill={COLORS.purple}
                    fillOpacity={showPhiDetail ? 0.3 : 0.15}
                    stroke={COLORS.purple}
                    strokeWidth={1.5}
                  />
                  <text
                    x={panelX + 18 + indent}
                    y={lineY + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill={COLORS.purple}
                  >
                    {'\u03c6'}
                  </text>
                </g>
              )}

              {/* Line number */}
              <text
                x={panelX + (isPhi ? 36 : 16) + indent}
                y={lineY + 1}
                fontSize="10"
                fill="#555"
                dominantBaseline="middle"
                style={{ fontFamily: FONTS.mono }}
              >
                {idx + 1}
              </text>

              {/* Code text */}
              <text
                x={panelX + (isPhi ? 54 : 34) + indent}
                y={lineY + 1}
                fontSize="12.5"
                fill={versionColor ?? (line.variable && !isSSA ? COLORS.red : '#ccc')}
                fontWeight={isHovered || isPhi ? '700' : '400'}
                dominantBaseline="middle"
                style={{ fontFamily: FONTS.mono, transition: 'fill 0.15s' }}
              >
                {line.text}
              </text>

              {/* Version badge for SSA */}
              {hasVersion && !isPhi && (
                <g>
                  <rect
                    x={panelX + PANEL_W - 50}
                    y={lineY - 9}
                    width={38}
                    height={18}
                    rx={9}
                    fill={versionColor}
                    fillOpacity={isHovered ? 0.3 : 0.12}
                    stroke={versionColor}
                    strokeWidth={isHovered ? 1.5 : 0.8}
                  />
                  <text
                    x={panelX + PANEL_W - 31}
                    y={lineY + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill={versionColor}
                  >
                    v{line.version}
                  </text>
                </g>
              )}

              {/* Non-SSA: red warning for reassignment */}
              {!isSSA && line.variable && idx > 0 && NON_SSA.slice(0, idx).some(l => l.variable === line.variable) && (
                <g>
                  <rect
                    x={panelX + PANEL_W - 62}
                    y={lineY - 8}
                    width={50}
                    height={16}
                    rx={8}
                    fill={COLORS.red}
                    fillOpacity={0.12}
                  />
                  <text
                    x={panelX + PANEL_W - 37}
                    y={lineY + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill={COLORS.red}
                  >
                    {t.reassigned}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <div className="my-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <style>{`text { font-family: ${FONTS.sans}; }`}</style>

        {/* Title */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight="700" fill={COLORS.dark}>
          {t.title}
        </text>
        <text x={W / 2} y={42} textAnchor="middle" fontSize="10" fill={COLORS.mid}>
          {t.hoverHint}
        </text>

        {/* Conversion arrow */}
        <defs>
          <marker id="ssa-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,1 L9,4 L0,7" fill={COLORS.primary} opacity={0.6} />
          </marker>
        </defs>
        <line
          x1={PANEL_LEFT + PANEL_W + 8}
          y1={CODE_TOP + 90}
          x2={PANEL_RIGHT - 8}
          y2={CODE_TOP + 90}
          stroke={COLORS.primary}
          strokeWidth={2}
          strokeDasharray="6 3"
          markerEnd="url(#ssa-arrow)"
          opacity={0.5}
        />
        <text
          x={(PANEL_LEFT + PANEL_W + PANEL_RIGHT) / 2}
          y={CODE_TOP + 80}
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={COLORS.primary}
        >
          SSA
        </text>

        {/* Left panel: Non-SSA */}
        {renderCodePanel(NON_SSA, PANEL_LEFT, false, t.before, COLORS.red)}

        {/* Right panel: SSA */}
        {renderCodePanel(SSA, PANEL_RIGHT, true, t.after, COLORS.green)}

        {/* Phi detail tooltip */}
        {showPhiDetail && (
          <g>
            <rect
              x={PANEL_RIGHT + 10}
              y={CODE_TOP + SSA.length * LINE_H + 10}
              width={PANEL_W - 20}
              height={56}
              rx={6}
              fill={COLORS.bg}
              stroke={COLORS.purple}
              strokeWidth={1.5}
              filter="url(#shadow)"
            />
            <text
              x={PANEL_RIGHT + 22}
              y={CODE_TOP + SSA.length * LINE_H + 30}
              fontSize="10"
              fontWeight="600"
              fill={COLORS.purple}
            >
              {t.phiExplain}
            </text>
            {SSA.find(l => l.isPhi)?.phiSources?.map((src, i) => (
              <text
                key={i}
                x={PANEL_RIGHT + 32}
                y={CODE_TOP + SSA.length * LINE_H + 45 + i * 14}
                fontSize="10"
                fill={COLORS.dark}
                style={{ fontFamily: FONTS.mono }}
              >
                {'\u2022'} {t.phiFrom} {src}
              </text>
            ))}
          </g>
        )}

        {/* Bottom summary labels */}
        <g transform={`translate(${PANEL_LEFT}, ${H - 28})`}>
          <rect x={0} y={-6} width={PANEL_W} height={22} rx={4} fill={COLORS.waste} fillOpacity={0.5} />
          <text x={PANEL_W / 2} y={6} textAnchor="middle" fontSize="10" fill={COLORS.red} fontWeight="600">
            {t.problem}
          </text>
        </g>
        <g transform={`translate(${PANEL_RIGHT}, ${H - 28})`}>
          <rect x={0} y={-6} width={PANEL_W} height={22} rx={4} fill={COLORS.valid} fillOpacity={0.5} />
          <text x={PANEL_W / 2} y={6} textAnchor="middle" fontSize="10" fill={COLORS.green} fontWeight="600">
            {t.solution}
          </text>
        </g>

        {/* Version color legend */}
        <g transform={`translate(${W / 2 - 120}, ${H - 8})`}>
          {VERSION_COLORS.map((c, i) => (
            <g key={i} transform={`translate(${i * 60}, 0)`}>
              <rect x={0} y={-6} width={12} height={8} rx={2} fill={c} opacity={0.8} />
              <text x={16} y={1} fontSize="9" fill={COLORS.mid}>
                v{i}{i === 3 ? ' (\u03c6)' : ''}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
