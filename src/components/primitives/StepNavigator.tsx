import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ReactNode } from 'react';

interface StepNavigatorProps {
  steps: {
    title: string;
    content: ReactNode;
  }[];
  className?: string;
}

export default function StepNavigator({ steps, className = '' }: StepNavigatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = (target: number) => {
    setDirection(target > currentStep ? 1 : -1);
    setCurrentStep(target);
  };
  const goNext = () => { if (currentStep < steps.length - 1) goTo(currentStep + 1); };
  const goPrev = () => { if (currentStep > 0) goTo(currentStep - 1); };
  const goReset = () => goTo(0);

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* 步骤指示器 */}
      <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`步骤 ${i + 1}: ${step.title}`}
            aria-current={i === currentStep ? 'step' : undefined}
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

      {/* 步骤内容 — 带过渡动画 */}
      <div className="p-4 relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
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
