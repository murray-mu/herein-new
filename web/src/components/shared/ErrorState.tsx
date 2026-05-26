interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400 space-y-3">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded bg-red-900/40 hover:bg-red-900/60 text-red-300 text-[11px] font-medium transition-colors"
        >
          重试 / Retry
        </button>
      )}
    </div>
  );
}
