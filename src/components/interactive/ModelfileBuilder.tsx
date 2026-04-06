import { useState } from 'react';
import { COLORS, FONTS } from './shared/colors';

const BASE_MODELS = ['qwen3:8b', 'llama3:8b', 'mistral:7b', 'gemma3:9b'];

export default function ModelfileBuilder({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const t = {
    zh: {
      fromLabel: 'FROM (基础模型)',
      systemPrompt: 'SYSTEM prompt',
      systemPromptPlaceholder: '你是一个有帮助的 AI 助手。',
      generatedModelfile: '生成的 Modelfile:',
    },
    en: {
      fromLabel: 'FROM (base model)',
      systemPrompt: 'SYSTEM prompt',
      systemPromptPlaceholder: 'You are a helpful AI assistant.',
      generatedModelfile: 'Generated Modelfile:',
    },
  }[locale];
  const [baseModel, setBaseModel] = useState('qwen3:8b');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [numCtx, setNumCtx] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState(t.systemPromptPlaceholder);

  const modelfile = [
    `FROM ${baseModel}`,
    '',
    `PARAMETER temperature ${temperature}`,
    `PARAMETER top_p ${topP}`,
    `PARAMETER num_ctx ${numCtx}`,
    '',
    `SYSTEM """`,
    systemPrompt,
    `"""`,
  ].join('\n');

  return (
    <div className="grid grid-cols-2 gap-4 my-4">
      {/* Left: Controls */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">{t.fromLabel}</label>
          <select value={baseModel} onChange={e => setBaseModel(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-xs border rounded">
            {BASE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">
            temperature: {temperature}
          </label>
          <input type="range" min={0} max={2} step={0.1} value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">
            top_p: {topP}
          </label>
          <input type="range" min={0} max={1} step={0.05} value={topP}
            onChange={e => setTopP(parseFloat(e.target.value))}
            className="w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">
            num_ctx: {numCtx}
          </label>
          <input type="range" min={512} max={32768} step={512} value={numCtx}
            onChange={e => setNumCtx(parseInt(e.target.value))}
            className="w-full" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700">{t.systemPrompt}</label>
          <textarea value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-xs border rounded h-16 resize-none"
            placeholder={t.systemPromptPlaceholder} />
        </div>
      </div>

      {/* Right: Generated Modelfile */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-1">{t.generatedModelfile}</p>
        <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-auto h-64 font-mono leading-relaxed">
          {modelfile}
        </pre>
        <p className="text-xs text-gray-400 mt-1">
          ollama create my-model -f Modelfile
        </p>
      </div>
    </div>
  );
}
