interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({ currentStep, steps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={steps.length}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const active = stepNum === currentStep;
        const done = stepNum < currentStep;
        const clickable = done && !!onStepClick;
        return (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => clickable && onStepClick?.(stepNum)}
              disabled={!clickable}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                active
                  ? 'bg-amber-500 text-zinc-950'
                  : done
                    ? 'bg-amber-950/30 text-amber-300 border border-amber-900/40 cursor-pointer'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              <span className="text-[11px] font-mono">{stepNum}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px ${done ? 'bg-amber-600/60' : 'bg-zinc-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
