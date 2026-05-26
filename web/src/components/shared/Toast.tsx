import { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, duration]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scaleIn">
      <div className="px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 shadow-lg shadow-black/40">
        {message}
      </div>
    </div>
  );
}
