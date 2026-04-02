// src/components/interactive/RoPERotationAnimation.tsx
import { useMemo } from 'react';
import { motion } from 'motion/react';
import StepNavigator from '../primitives/StepNavigator';
import { COLORS, HEAD_COLORS } from './shared/colors';

const SVG_SIZE = 280;
const CENTER = SVG_SIZE / 2;
const RADIUS = 100;
const THETA = 30; // degrees per position for visualization

function polarToXY(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER - r * Math.sin(rad) };
}

function Arrow({ fromAngle, toAngle, r, color, label, showArc }: {
  fromAngle: number; toAngle: number; r: number; color: string; label: string; showArc?: boolean;
}) {
  const from = polarToXY(fromAngle, 0);
  const to = polarToXY(toAngle, r);
  const labelPos = polarToXY(toAngle, r + 18);

  // Arc for angle indicator
  const arcR = 30;
  const arcStart = polarToXY(fromAngle || 0, arcR);
  const arcEnd = polarToXY(toAngle, arcR);
  const sweep = toAngle > fromAngle ? 0 : 1;

  return (
    <g>
      <motion.line
        x1={CENTER} y1={CENTER}
        x2={to.x} y2={to.y}
        stroke={color} strokeWidth={2.5}
        markerEnd={`url(#arrow-${color.replace('#', '')})`}
        initial={{ x2: CENTER, y2: CENTER }}
        animate={{ x2: to.x, y2: to.y }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.text
        x={labelPos.x} y={labelPos.y}
        textAnchor="middle" fontSize="11" fontWeight="600" fill={color}
        fontFamily="system-ui"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.text>
      {showArc && Math.abs(toAngle) > 1 && (
        <motion.path
          d={`M ${polarToXY(0, arcR).x} ${polarToXY(0, arcR).y} A ${arcR} ${arcR} 0 0 ${sweep} ${arcEnd.x} ${arcEnd.y}`}
          fill="none" stroke={color} strokeWidth={1} strokeDasharray="3,2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4 }}
        />
      )}
    </g>
  );
}

function PolarGrid() {
  return (
    <g opacity={0.3}>
      {/* Concentric circles */}
      {[40, 70, 100].map(r => (
        <circle key={r} cx={CENTER} cy={CENTER} r={r}
          fill="none" stroke="#e5e7eb" strokeWidth={0.5} />
      ))}
      {/* Axis lines */}
      <line x1={CENTER - RADIUS - 20} y1={CENTER} x2={CENTER + RADIUS + 20} y2={CENTER}
        stroke="#d1d5db" strokeWidth={0.5} />
      <line x1={CENTER} y1={CENTER - RADIUS - 20} x2={CENTER} y2={CENTER + RADIUS + 20}
        stroke="#d1d5db" strokeWidth={0.5} />
    </g>
  );
}

export default function RoPERotationAnimation() {
  const steps = useMemo(() => [
    {
      title: 'Q 向量（position 0）',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[280px] mx-auto">
            <defs>
              <marker id={`arrow-${COLORS.primary.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
            </defs>
            <PolarGrid />
            <Arrow fromAngle={0} toAngle={0} r={RADIUS} color={COLORS.primary} label="Q₀" />
            <text x={CENTER} y={SVG_SIZE - 8} textAnchor="middle" fontSize="10" fill={COLORS.mid}
              fontFamily="system-ui">Position 0: 旋转角度 = 0</text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            把 Q 向量的一对维度 (d₂ᵢ, d₂ᵢ₊₁) 看作二维平面上的向量
          </p>
        </div>
      ),
    },
    {
      title: 'Position 1: Q 和 K 各旋转 θ',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[280px] mx-auto">
            <defs>
              <marker id={`arrow-${COLORS.primary.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
              <marker id={`arrow-${COLORS.green.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
              </marker>
            </defs>
            <PolarGrid />
            {/* Original (ghost) */}
            <line x1={CENTER} y1={CENTER}
              x2={CENTER + RADIUS * 0.7} y2={CENTER}
              stroke={COLORS.primary} strokeWidth={1} opacity={0.2} strokeDasharray="4,3" />
            <Arrow fromAngle={0} toAngle={THETA} r={RADIUS} color={COLORS.primary}
              label={`Q₁ (θ)`} showArc />
            <Arrow fromAngle={0} toAngle={THETA} r={RADIUS * 0.75} color={COLORS.green}
              label={`K₁ (θ)`} showArc />
            <text x={CENTER} y={SVG_SIZE - 8} textAnchor="middle" fontSize="10" fill={COLORS.mid}
              fontFamily="system-ui">Position 1: 两个向量都旋转 θ = {THETA}°</text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            RoPE 对 Q 和 K 施加<strong>相同的</strong>旋转，角度 = position × θ
          </p>
        </div>
      ),
    },
    {
      title: 'Position 3 vs 5: 内积只依赖差值',
      content: (
        <div className="space-y-2">
          <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[280px] mx-auto">
            <defs>
              <marker id={`arrow-${COLORS.primary.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.primary} />
              </marker>
              <marker id={`arrow-${COLORS.green.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.green} />
              </marker>
              <marker id={`arrow-${COLORS.orange.replace('#', '')}`} markerWidth="8" markerHeight="6"
                refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.orange} />
              </marker>
            </defs>
            <PolarGrid />
            <Arrow fromAngle={0} toAngle={3 * THETA} r={RADIUS} color={COLORS.primary}
              label={`Q₃ (3θ)`} showArc />
            <Arrow fromAngle={0} toAngle={5 * THETA} r={RADIUS * 0.75} color={COLORS.green}
              label={`K₅ (5θ)`} showArc />
            {/* Angle difference arc */}
            <motion.path
              d={`M ${polarToXY(3 * THETA, 55).x} ${polarToXY(3 * THETA, 55).y} A 55 55 0 0 0 ${polarToXY(5 * THETA, 55).x} ${polarToXY(5 * THETA, 55).y}`}
              fill="none" stroke={COLORS.orange} strokeWidth={2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
            <motion.text
              x={polarToXY(4 * THETA, 68).x} y={polarToXY(4 * THETA, 68).y}
              textAnchor="middle" fontSize="11" fontWeight="700" fill={COLORS.orange}
              fontFamily="system-ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Δ = 2θ
            </motion.text>
            <text x={CENTER} y={SVG_SIZE - 8} textAnchor="middle" fontSize="10" fill={COLORS.mid}
              fontFamily="system-ui">Q₃ᵀK₅ = Qᵀ R(5−3)θ K — 只依赖相对距离</text>
          </svg>
          <p className="text-sm text-gray-600 text-center">
            <strong>关键性质：</strong>Q̃ₘᵀK̃ₙ = QᵀR₍ₙ₋ₘ₎θK — 内积只依赖 n - m
          </p>
        </div>
      ),
    },
    {
      title: '多维度对：不同频率',
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'θ₁ (低频)', theta: 10, color: HEAD_COLORS[0] },
              { label: 'θ₂ (中频)', theta: 30, color: HEAD_COLORS[1] },
              { label: 'θ₃ (高频)', theta: 70, color: HEAD_COLORS[2] },
            ].map(({ label, theta, color }) => {
              const size = 120;
              const c = size / 2;
              const r = 40;
              const positions = [0, 1, 2, 3];
              return (
                <div key={label} className="text-center">
                  <div className="text-xs font-semibold mb-1" style={{ color }}>{label}</div>
                  <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
                    {/* Grid */}
                    <circle cx={c} cy={c} r={r} fill="none" stroke="#e5e7eb" strokeWidth={0.5} />
                    <line x1={c - r - 5} y1={c} x2={c + r + 5} y2={c} stroke="#e5e7eb" strokeWidth={0.3} />
                    <line x1={c} y1={c - r - 5} x2={c} y2={c + r + 5} stroke="#e5e7eb" strokeWidth={0.3} />
                    {/* Position vectors */}
                    {positions.map(p => {
                      const angle = p * theta;
                      const rad = (angle * Math.PI) / 180;
                      const endX = c + r * Math.cos(rad);
                      const endY = c - r * Math.sin(rad);
                      const labelX = c + (r + 12) * Math.cos(rad);
                      const labelY = c - (r + 12) * Math.sin(rad);
                      return (
                        <g key={p}>
                          <motion.line
                            x1={c} y1={c} x2={endX} y2={endY}
                            stroke={color} strokeWidth={1.5} opacity={0.4 + p * 0.2}
                            initial={{ x2: c, y2: c }}
                            animate={{ x2: endX, y2: endY }}
                            transition={{ duration: 0.4, delay: p * 0.15 }}
                          />
                          <motion.text x={labelX} y={labelY + 3}
                            textAnchor="middle" fontSize="7" fill={color} fontFamily="monospace"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: p * 0.15 + 0.3 }}
                          >
                            p{p}
                          </motion.text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="text-[10px] text-gray-500">每步旋转 {theta}°</div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 text-center">
            不同维度对使用不同 θᵢ，类似 Sinusoidal 的多频率思想
            <br />
            <span className="text-xs">低频 → 捕捉远距离位置关系；高频 → 捕捉近距离精确位置</span>
          </p>
        </div>
      ),
    },
  ], []);

  return <StepNavigator steps={steps} />;
}
