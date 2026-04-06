import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const W = 580;

interface MaskStep {
  fsmState: string;
  validChars: string;
  tokenMask: { token: string; allowed: boolean }[];
  generated: string;
  explanation: string;
}

const SCHEMA_TEXT = '{ "type": "object", "properties": { "name": { "type": "string" } }, "required": ["name"] }';

const STEPS: MaskStep[] = [
  {
    fsmState: 'OBJECT_START',
    validChars: '{',
    tokenMask: [
      { token: '{', allowed: true },
      { token: '"', allowed: false },
      { token: 'hello', allowed: false },
      { token: '[', allowed: false },
      { token: '123', allowed: false },
      { token: 'true', allowed: false },
    ],
    generated: '',
    explanation: 'JSON Object 必须以 { 开头，只有 { 合法',
  },
  {
    fsmState: 'KEY_START',
    validChars: '"',
    tokenMask: [
      { token: '{"', allowed: false },
      { token: '"name"', allowed: true },
      { token: '"age"', allowed: false },
      { token: '"', allowed: false },
      { token: 'name', allowed: false },
      { token: '}', allowed: false },
    ],
    generated: '{',
    explanation: 'Schema 要求 key 为 "name"，只允许包含 "name" 的 token',
  },
  {
    fsmState: 'COLON',
    validChars: ':',
    tokenMask: [
      { token: ':', allowed: true },
      { token: '": "', allowed: true },
      { token: ',', allowed: false },
      { token: '}', allowed: false },
      { token: '"', allowed: false },
      { token: ' ', allowed: false },
    ],
    generated: '{"name"',
    explanation: 'Key 后面必须是冒号分隔符',
  },
  {
    fsmState: 'VALUE_STRING_START',
    validChars: '"...',
    tokenMask: [
      { token: '"Alice"', allowed: true },
      { token: '"Bob"', allowed: true },
      { token: '"', allowed: true },
      { token: '123', allowed: false },
      { token: 'null', allowed: false },
      { token: 'true', allowed: false },
    ],
    generated: '{"name": ',
    explanation: 'Schema 指定 type: "string"，值必须是字符串（" 开头）',
  },
  {
    fsmState: 'OBJECT_END',
    validChars: '}',
    tokenMask: [
      { token: '}', allowed: true },
      { token: ', "', allowed: false },
      { token: '"', allowed: false },
      { token: ']', allowed: false },
      { token: 'EOS', allowed: false },
      { token: ' ', allowed: false },
    ],
    generated: '{"name": "Alice"',
    explanation: '没有其他 required 字段，Object 必须关闭',
  },
];

export default function TokenMaskGeneration({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      jsonSchema: 'JSON Schema:',
      generated: '已生成:',
      empty: '(空)',
      fsmState: 'FSM 状态',
      validChars: '合法字符集',
      tokenMask: 'Token Mask:',
      prev: '← 上一步',
      next: '下一步 →',
    },
    en: {
      jsonSchema: 'JSON Schema:',
      generated: 'Generated:',
      empty: '(empty)',
      fsmState: 'FSM State',
      validChars: 'Valid Chars',
      tokenMask: 'Token Mask:',
      prev: '← Previous',
      next: 'Next →',
    },
  }[locale];

  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  return (
    <div style={{ fontFamily: FONTS.sans, maxWidth: W }}>
      {/* Schema */}
      <div style={{
        padding: '8px 12px', background: COLORS.dark, borderRadius: '8px 8px 0 0',
        fontFamily: FONTS.mono, fontSize: 10, color: COLORS.light, overflowX: 'auto',
      }}>
        <span style={{ color: COLORS.mid }}>{t.jsonSchema} </span>{SCHEMA_TEXT}
      </div>

      {/* Progress bar */}
      <div style={{
        display: 'flex', gap: 2, padding: '8px 12px',
        background: COLORS.bgAlt, borderBottom: '1px solid #e5e7eb',
      }}>
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStepIdx(i)} style={{
            flex: 1, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
            background: i <= stepIdx ? COLORS.primary : COLORS.light,
          }} />
        ))}
      </div>

      {/* Current state */}
      <div style={{ padding: '12px 16px', background: COLORS.bg, border: '1px solid #e5e7eb', borderTop: 'none' }}>
        {/* Generated so far */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: COLORS.mid }}>{t.generated} </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.dark, fontWeight: 600 }}>
            {step.generated || t.empty}
            <span style={{ color: COLORS.orange }}>▌</span>
          </span>
        </div>

        {/* FSM state & valid chars */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: COLORS.mid, marginBottom: 2 }}>{t.fsmState}</div>
            <div style={{
              padding: '4px 10px', background: COLORS.highlight, borderRadius: 4,
              fontFamily: FONTS.mono, fontSize: 12, fontWeight: 600, color: COLORS.dark,
            }}>
              {step.fsmState}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: COLORS.mid, marginBottom: 2 }}>{t.validChars}</div>
            <div style={{
              padding: '4px 10px', background: '#ecfdf5', borderRadius: 4,
              fontFamily: FONTS.mono, fontSize: 12, fontWeight: 600, color: COLORS.green,
            }}>
              {step.validChars}
            </div>
          </div>
        </div>

        {/* Token mask */}
        <div style={{ fontSize: 11, color: COLORS.mid, marginBottom: 6 }}>{t.tokenMask}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {step.tokenMask.map((t, i) => (
            <div key={i} style={{
              padding: '5px 10px', borderRadius: 4,
              border: `1.5px solid ${t.allowed ? COLORS.green : '#e5e7eb'}`,
              background: t.allowed ? '#ecfdf5' : COLORS.masked,
              color: t.allowed ? COLORS.green : '#bbb',
              fontFamily: FONTS.mono, fontSize: 12, fontWeight: 500,
              textDecoration: t.allowed ? 'none' : 'line-through',
            }}>
              {t.token}
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div style={{
          padding: '8px 12px', background: COLORS.bgAlt, borderRadius: 6,
          fontSize: 12, color: COLORS.dark, lineHeight: 1.5,
        }}>
          💡 {step.explanation}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', background: COLORS.bgAlt,
        borderRadius: '0 0 8px 8px', border: '1px solid #e5e7eb', borderTop: 'none',
      }}>
        <button
          onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
          disabled={stepIdx === 0}
          style={{
            padding: '4px 12px', borderRadius: 4, border: 'none', cursor: stepIdx > 0 ? 'pointer' : 'not-allowed',
            background: stepIdx > 0 ? COLORS.primary : COLORS.light,
            color: stepIdx > 0 ? '#fff' : COLORS.mid, fontSize: 12, fontFamily: FONTS.sans,
          }}
        >
          {t.prev}
        </button>
        <span style={{ fontSize: 11, color: COLORS.mid }}>
          {stepIdx + 1} / {STEPS.length}
        </span>
        <button
          onClick={() => setStepIdx(Math.min(STEPS.length - 1, stepIdx + 1))}
          disabled={stepIdx === STEPS.length - 1}
          style={{
            padding: '4px 12px', borderRadius: 4, border: 'none',
            cursor: stepIdx < STEPS.length - 1 ? 'pointer' : 'not-allowed',
            background: stepIdx < STEPS.length - 1 ? COLORS.primary : COLORS.light,
            color: stepIdx < STEPS.length - 1 ? '#fff' : COLORS.mid,
            fontSize: 12, fontFamily: FONTS.sans,
          }}
        >
          {t.next}
        </button>
      </div>
    </div>
  );
}
