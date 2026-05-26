import { ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'herein-first-visit-done';

export default function FirstVisitHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3 animate-fadeInSlow">
      <div className="flex items-center gap-2 text-xs text-amber-200">
        <span className="text-amber-400 font-bold text-sm">↗</span>
        <span>试着切换下方的视角，感受不同 &nbsp;/&nbsp; Try toggling the perspective below</span>
      </div>
      <div className="flex items-center gap-2">
        <ArrowDown className="h-4 w-4 text-amber-500 animate-pulse" />
        <button
          onClick={() => {
            setVisible(false);
            localStorage.setItem(STORAGE_KEY, 'true');
          }}
          className="text-[11px] text-amber-400/70 hover:text-amber-300 transition-colors shrink-0"
        >
          知道了
        </button>
      </div>
    </div>
  );
}

/** Call this when the user toggles perspective for the first time */
export function dismissFirstVisitHint() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, 'true');
  }
}
