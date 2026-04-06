import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;
const H = 420;

interface FsmState {
  id: string;
  label: { zh: string; en: string };
  x: number;
  y: number;
}

interface FsmTransition {
  from: string;
  to: string;
  label: string;
}

// Simplified JSON FSM: { "name": "..." }
const STATES: FsmState[] = [
  { id: 'start', label: { zh: 'START', en: 'START' }, x: 60, y: 100 },
  { id: 'open', label: { zh: '{ 已打开', en: '{ opened' }, x: 180, y: 100 },
  { id: 'key_q1', label: { zh: '"key', en: '"key' }, x: 300, y: 60 },
  { id: 'key_name', label: { zh: '"name"', en: '"name"' }, x: 400, y: 60 },
  { id: 'colon', label: { zh: ': 分隔', en: ': separator' }, x: 500, y: 100 },
  { id: 'val_q1', label: { zh: '"val', en: '"val' }, x: 500, y: 200 },
  { id: 'val_str', label: { zh: '字符串内容', en: 'string content' }, x: 380, y: 250 },
  { id: 'val_q2', label: { zh: '"val 结束', en: '"val end' }, x: 240, y: 250 },
  { id: 'close', label: { zh: '} 关闭', en: '} closed' }, x: 120, y: 250 },
  { id: 'end', label: { zh: 'END', en: 'END' }, x: 60, y: 200 },
];

const TRANSITIONS: FsmTransition[] = [
  { from: 'start', to: 'open', label: '{' },
  { from: 'open', to: 'key_q1', label: '"' },
  { from: 'key_q1', to: 'key_name', label: 'n,a,m,e' },
  { from: 'key_name', to: 'colon', label: '":' },
  { from: 'colon', to: 'val_q1', label: '"' },
  { from: 'val_q1', to: 'val_str', label: 'a-z...' },
  { from: 'val_str', to: 'val_str', label: 'a-z...' },
  { from: 'val_str', to: 'val_q2', label: '"' },
  { from: 'val_q2', to: 'close', label: '}' },
  { from: 'close', to: 'end', label: 'EOS' },
];

const ALL_TOKENS = ['{', '"', 'name', '":', ' "', 'Alice', '"', '}', 'hello', '[', '123', 'true'];

export default function FSMConstrainedDecoding({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      output: '输出:',
      click_hint: '(点击合法 token 开始生成)',
      reset: '重置',
      vocab_hint: 'Token 词表（绿色=合法，灰色=非法）:',
    },
    en: {
      output: 'Output:',
      click_hint: '(click valid tokens to generate)',
      reset: 'Reset',
      vocab_hint: 'Token vocabulary (green=valid, gray=invalid):',
    },
  }[locale];
  const [currentState, setCurrentState] = useState('start');
  const [generated, setGenerated] = useState<string[]>([]);

  const stateMap = Object.fromEntries(STATES.map(s => [s.id, s]));

  // Get valid transitions from current state
  const validTransitions = TRANSITIONS.filter(t => t.from === currentState);
  const validTargets = new Set(validTransitions.map(t => t.to));

  // Determine which tokens are valid
  const validTokenMap: Record<string, string> = {};
  for (const t of validTransitions) {
    // Map transition labels to actual tokens
    if (t.label === '{') validTokenMap['{'] = t.to;
    if (t.label === '"') validTokenMap['"'] = t.to;
    if (t.label === 'n,a,m,e') validTokenMap['name'] = t.to;
    if (t.label === '":') validTokenMap['":'] = t.to;
    if (t.label === '"') { validTokenMap['"'] = t.to; validTokenMap[' "'] = t.to; }
    if (t.label === 'a-z...') { validTokenMap['Alice'] = t.to; }
    if (t.label === '}') validTokenMap['}'] = t.to;
    if (t.label === 'EOS') validTokenMap['EOS'] = t.to;
  }

  const clickToken = (token: string) => {
    const target = validTokenMap[token];
    if (target) {
      setCurrentState(target);
      setGenerated(prev => [...prev, token]);
    }
  };

  const reset = () => {
    setCurrentState('start');
    setGenerated([]);
  };

  return (
    <div style={{ fontFamily: FONTS.sans }}>
      {/* Generated output */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        padding: '8px 12px', background: COLORS.bgAlt, borderRadius: 6,
      }}>
        <span style={{ fontSize: 12, color: COLORS.mid }}>{t.output}</span>
        <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.dark }}>
          {generated.length > 0 ? generated.join('') : t.click_hint}
        </span>
        <button onClick={reset} style={{
          marginLeft: 'auto', padding: '3px 10px', borderRadius: 4, border: 'none',
          background: COLORS.light, cursor: 'pointer', fontSize: 11, fontFamily: FONTS.sans,
        }}>{t.reset}</button>
      </div>

      <svg viewBox={`0 0 ${W} 280`} className="w-full" style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: COLORS.bg }}>
        {/* FSM States */}
        {STATES.map(s => {
          const isCurrent = s.id === currentState;
          const isReachable = validTargets.has(s.id);
          const r = 28;
          return (
            <g key={s.id}>
              <circle cx={s.x} cy={s.y} r={r}
                fill={isCurrent ? COLORS.highlight : isReachable ? '#ecfdf5' : COLORS.bgAlt}
                stroke={isCurrent ? COLORS.orange : isReachable ? COLORS.green : COLORS.mid}
                strokeWidth={isCurrent ? 2.5 : 1}
              />
              {s.id === 'end' && <circle cx={s.x} cy={s.y} r={r - 4} fill="none" stroke={COLORS.mid} strokeWidth={1} />}
              <text x={s.x} y={s.y + 4} fontSize={9} fill={COLORS.dark}
                fontFamily={FONTS.sans} textAnchor="middle" fontWeight={isCurrent ? 600 : 400}>
                {s.label[locale]}
              </text>
            </g>
          );
        })}

        {/* Transitions (simplified: straight lines) */}
        {TRANSITIONS.filter(t => t.from !== t.to).map((t, i) => {
          const from = stateMap[t.from];
          const to = stateMap[t.to];
          if (!from || !to) return null;
          const isValid = t.from === currentState;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offsetX = (dx / dist) * 28;
          const offsetY = (dy / dist) * 28;
          return (
            <g key={i}>
              <line
                x1={from.x + offsetX} y1={from.y + offsetY}
                x2={to.x - offsetX} y2={to.y - offsetY}
                stroke={isValid ? COLORS.green : COLORS.mid}
                strokeWidth={isValid ? 2 : 1}
                opacity={isValid ? 1 : 0.3}
                markerEnd="url(#arrowFSM)"
              />
              <text
                x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                fontSize={9} fill={isValid ? COLORS.green : COLORS.mid}
                fontFamily={FONTS.mono} textAnchor="middle">
                {t.label}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="arrowFSM" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
            <path d="M0,0 L8,3 L0,6" fill={COLORS.mid} />
          </marker>
        </defs>
      </svg>

      {/* Token vocabulary */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: COLORS.mid, marginBottom: 6 }}>{t.vocab_hint}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {ALL_TOKENS.map((token, i) => {
            const isValid = token in validTokenMap;
            return (
              <button
                key={i}
                onClick={() => clickToken(token)}
                disabled={!isValid}
                style={{
                  padding: '4px 10px', borderRadius: 4,
                  border: `1px solid ${isValid ? COLORS.green : '#e5e7eb'}`,
                  background: isValid ? '#ecfdf5' : COLORS.masked,
                  color: isValid ? COLORS.green : '#ccc',
                  cursor: isValid ? 'pointer' : 'not-allowed',
                  fontSize: 12, fontFamily: FONTS.mono, fontWeight: 500,
                }}
              >
                {token}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
