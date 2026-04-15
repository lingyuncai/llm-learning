// src/components/interactive/LlamaCppChatTemplateRenderer.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

type TemplateType = 'chatml' | 'llama3';

interface LlamaCppChatTemplateRendererProps {
  locale?: 'zh' | 'en';
}

const t = {
  zh: {
    title: 'Chat Template 渲染对比',
    messages: '消息列表',
    output: '渲染输出',
    role: '角色',
    content: '内容',
    addMessage: '+ 添加消息',
    remove: '删除',
    specialToken: '特殊 token',
    roleText: '角色标记',
    contentText: '内容文本',
    separator: '分隔符',
    templateLabel: '模板类型',
    chatMLDesc: 'ChatML 格式（Qwen 等模型使用）',
    llama3Desc: 'Llama-3 格式',
    jinjaTemplate: 'Jinja2 模板',
    system: '系统',
    user: '用户',
    assistant: '助手',
    defaultSystem: '你是一个有帮助的助手',
    defaultUser: '你好，请介绍一下自己',
  },
  en: {
    title: 'Chat Template Rendering Comparison',
    messages: 'Messages',
    output: 'Rendered Output',
    role: 'Role',
    content: 'Content',
    addMessage: '+ Add Message',
    remove: 'Remove',
    specialToken: 'Special token',
    roleText: 'Role marker',
    contentText: 'Content text',
    separator: 'Separator',
    templateLabel: 'Template Type',
    chatMLDesc: 'ChatML format (used by Qwen, etc.)',
    llama3Desc: 'Llama-3 format',
    jinjaTemplate: 'Jinja2 Template',
    system: 'system',
    user: 'user',
    assistant: 'assistant',
    defaultSystem: 'You are a helpful assistant',
    defaultUser: 'Hello, please introduce yourself',
  },
};

const ROLE_COLORS = {
  system: { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  user: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  assistant: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
};

/** Token span types for syntax highlighting */
type TokenSpanType = 'special' | 'role' | 'content' | 'newline';

interface TokenSpan {
  text: string;
  type: TokenSpanType;
}

function renderChatML(messages: Message[]): TokenSpan[] {
  const spans: TokenSpan[] = [];
  for (const msg of messages) {
    spans.push({ text: '<|im_start|>', type: 'special' });
    spans.push({ text: msg.role, type: 'role' });
    spans.push({ text: '\n', type: 'newline' });
    spans.push({ text: msg.content, type: 'content' });
    spans.push({ text: '<|im_end|>', type: 'special' });
    spans.push({ text: '\n', type: 'newline' });
  }
  // add_generation_prompt
  spans.push({ text: '<|im_start|>', type: 'special' });
  spans.push({ text: 'assistant', type: 'role' });
  spans.push({ text: '\n', type: 'newline' });
  return spans;
}

function renderLlama3(messages: Message[]): TokenSpan[] {
  const spans: TokenSpan[] = [];
  spans.push({ text: '<|begin_of_text|>', type: 'special' });
  for (const msg of messages) {
    spans.push({ text: '<|start_header_id|>', type: 'special' });
    spans.push({ text: msg.role, type: 'role' });
    spans.push({ text: '<|end_header_id|>', type: 'special' });
    spans.push({ text: '\n\n', type: 'newline' });
    spans.push({ text: msg.content, type: 'content' });
    spans.push({ text: '<|eot_id|>', type: 'special' });
  }
  // add_generation_prompt
  spans.push({ text: '<|start_header_id|>', type: 'special' });
  spans.push({ text: 'assistant', type: 'role' });
  spans.push({ text: '<|end_header_id|>', type: 'special' });
  spans.push({ text: '\n\n', type: 'newline' });
  return spans;
}

const CHATML_JINJA = `{%- for message in messages -%}
  {{- '<|im_start|>' + message.role + '\\n'
      + message.content + '<|im_end|>\\n' -}}
{%- endfor -%}
{%- if add_generation_prompt -%}
  {{- '<|im_start|>assistant\\n' -}}
{%- endif -%}`;

const LLAMA3_JINJA = `{{- '<|begin_of_text|>' -}}
{%- for message in messages -%}
  {{- '<|start_header_id|>' + message.role
      + '<|end_header_id|>\\n\\n'
      + message.content + '<|eot_id|>' -}}
{%- endfor -%}
{%- if add_generation_prompt -%}
  {{- '<|start_header_id|>assistant<|end_header_id|>\\n\\n' -}}
{%- endif -%}`;

const SPAN_STYLES: Record<TokenSpanType, string> = {
  special: 'bg-amber-100 text-amber-800 font-semibold rounded px-0.5',
  role: 'bg-purple-100 text-purple-800 font-medium rounded px-0.5',
  content: 'text-gray-800',
  newline: 'text-gray-400',
};

function RenderedOutput({ spans }: { spans: TokenSpan[] }) {
  return (
    <pre className="text-sm leading-relaxed whitespace-pre-wrap break-all font-mono p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
      {spans.map((span, i) => {
        if (span.type === 'newline') {
          return <span key={i}>{span.text}</span>;
        }
        return (
          <motion.span
            key={`${i}-${span.text}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            className={SPAN_STYLES[span.type]}
          >
            {span.text}
          </motion.span>
        );
      })}
    </pre>
  );
}

export default function LlamaCppChatTemplateRenderer({
  locale = 'zh',
}: LlamaCppChatTemplateRendererProps) {
  const l = t[locale];

  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: l.defaultSystem },
    { role: 'user', content: l.defaultUser },
  ]);
  const [template, setTemplate] = useState<TemplateType>('chatml');

  const spans = useMemo(() => {
    return template === 'chatml' ? renderChatML(messages) : renderLlama3(messages);
  }, [messages, template]);

  const jinjaSource = template === 'chatml' ? CHATML_JINJA : LLAMA3_JINJA;

  const updateMessage = (index: number, field: 'role' | 'content', value: string) => {
    setMessages((prev) => {
      const next = [...prev];
      if (field === 'role') {
        next[index] = { ...next[index], role: value as Message['role'] };
      } else {
        next[index] = { ...next[index], content: value };
      }
      return next;
    });
  };

  const removeMessage = (index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  const addMessage = () => {
    setMessages((prev) => [...prev, { role: 'user', content: '' }]);
  };

  return (
    <div className="my-6 p-4 rounded-xl border border-gray-200 bg-white">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">{l.title}</h4>

      {/* Template selector */}
      <div className="flex gap-2 mb-4">
        {(['chatml', 'llama3'] as TemplateType[]).map((tmpl) => {
          const isActive = template === tmpl;
          const label = tmpl === 'chatml' ? 'ChatML' : 'Llama-3';
          const desc = tmpl === 'chatml' ? l.chatMLDesc : l.llama3Desc;
          return (
            <button
              key={tmpl}
              onClick={() => setTemplate(tmpl)}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{label}</div>
              <div className="text-xs opacity-70 mt-0.5">{desc}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Message editor */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">{l.messages}</div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg border p-2"
                  style={{
                    backgroundColor: ROLE_COLORS[msg.role].bg,
                    borderColor: ROLE_COLORS[msg.role].border,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <select
                      value={msg.role}
                      onChange={(e) => updateMessage(i, 'role', e.target.value)}
                      className="text-xs font-medium rounded px-1.5 py-0.5 border border-gray-300 bg-white"
                    >
                      <option value="system">{l.system}</option>
                      <option value="user">{l.user}</option>
                      <option value="assistant">{l.assistant}</option>
                    </select>
                    {messages.length > 1 && (
                      <button
                        onClick={() => removeMessage(i)}
                        className="ml-auto text-xs text-red-500 hover:text-red-700"
                      >
                        {l.remove}
                      </button>
                    )}
                  </div>
                  <textarea
                    value={msg.content}
                    onChange={(e) => updateMessage(i, 'content', e.target.value)}
                    rows={2}
                    className="w-full text-sm rounded border border-gray-200 px-2 py-1 bg-white/80 resize-y"
                    placeholder={l.content}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              onClick={addMessage}
              className="w-full text-xs text-gray-500 hover:text-blue-600 border border-dashed border-gray-300 hover:border-blue-300 rounded-lg py-1.5 transition-colors"
            >
              {l.addMessage}
            </button>
          </div>
        </div>

        {/* Right: Rendered output */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">{l.output}</div>
          <RenderedOutput spans={spans} />

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              {l.specialToken}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-purple-100 border border-purple-300" />
              {l.roleText}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-white border border-gray-300" />
              {l.contentText}
            </span>
          </div>
        </div>
      </div>

      {/* Jinja2 template source */}
      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-blue-600">
          {l.jinjaTemplate}
        </summary>
        <pre className="mt-2 text-xs bg-gray-50 rounded-lg border border-gray-200 p-3 overflow-x-auto font-mono text-gray-700 whitespace-pre-wrap">
          {jinjaSource}
        </pre>
      </details>
    </div>
  );
}
