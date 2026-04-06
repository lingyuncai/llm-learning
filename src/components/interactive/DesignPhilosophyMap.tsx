import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 380;

interface EnginePos {
  name: string;
  x: number;
  y: number;
  color: string;
  desc: string;
}

// Triangle vertices: top = throughput, bottom-left = programmable, bottom-right = ease-of-use
const TX = W / 2, TY = 60;   // throughput (top)
const PX = 100,   PY = 310;  // programmable (bottom-left)
const EX = 480,   EY = 310;  // ease-of-use (bottom-right)

const ENGINES: EnginePos[] = [
  { name: 'TensorRT-LLM', x: TX + 30,  y: TY + 50,  color: COLORS.purple, desc: '极致吞吐' },
  { name: 'vLLM',         x: TX - 40,  y: TY + 110, color: COLORS.primary, desc: '吞吐优先' },
  { name: 'SGLang',       x: PX + 100, y: PY - 80,  color: COLORS.green,   desc: '可编程+高性能' },
  { name: 'Ollama',       x: EX - 80,  y: EY - 50,  color: COLORS.orange,  desc: '易用优先' },
];

export default function DesignPhilosophyMap({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      title: '推理引擎设计哲学定位',
      throughput: '吞吐量',
      programmable: '可编程性',
      easeOfUse: '易用性',
    },
    en: {
      title: 'Inference Engine Design Philosophy Positioning',
      throughput: 'Throughput',
      programmable: 'Programmability',
      easeOfUse: 'Ease of Use',
    },
  }[locale];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <text x={W / 2} y={22} textAnchor="middle" fontSize="14" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>
        {t.title}
      </text>

      {/* Triangle */}
      <polygon points={`${TX},${TY} ${PX},${PY} ${EX},${EY}`}
        fill={COLORS.bgAlt} stroke={COLORS.light} strokeWidth="1.5" />

      {/* Vertex labels */}
      <text x={TX} y={TY - 10} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.throughput}</text>
      <text x={PX - 10} y={PY + 20} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.programmable}</text>
      <text x={EX + 10} y={EY + 20} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={COLORS.dark} fontFamily={FONTS.sans}>{t.easeOfUse}</text>

      {/* Engine dots + labels */}
      {ENGINES.map((e) => (
        <g key={e.name}>
          <circle cx={e.x} cy={e.y} r={8}
            fill={e.color} opacity={0.9} stroke="#fff" strokeWidth="2" />
          <text x={e.x} y={e.y - 14} textAnchor="middle" fontSize="11"
            fontWeight="700" fill={e.color} fontFamily={FONTS.sans}>
            {e.name}
          </text>
          <text x={e.x} y={e.y + 22} textAnchor="middle" fontSize="9"
            fill={COLORS.mid} fontFamily={FONTS.sans}>
            {e.desc}
          </text>
        </g>
      ))}
    </svg>
  );
}
