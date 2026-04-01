import { useState, type ReactNode } from 'react';

interface StepNavigatorProps {
  steps: {
    title: string;
    content: ReactNode;
  }[];
  className?: string;
}

export default function StepNavigator({ steps, className = '' }: StepNavigatorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 0));
  const goReset = () => setCurrentStep(0);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* 步骤指示器 */}
      <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
              i === currentStep
                ? 'bg-primary-600 text-white'
                : i < currentStep
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <span className="ml-3 text-sm text-gray-600 font-medium">
          {steps[currentStep].title}
        </span>
      </div>

      {/* 步骤内容 */}
      <div className="p-4">
        {steps[currentStep].content}
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={goReset}
          disabled={currentStep === 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
        >
          重置
        </button>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            上一步
          </button>
          <button
            onClick={goNext}
            disabled={currentStep === steps.length - 1}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-30"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  );
}
