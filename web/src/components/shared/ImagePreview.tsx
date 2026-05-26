import { useEffect, useCallback } from 'react';
import { X, Download } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  onClose: () => void;
  onDownload: () => void;
}

export default function ImagePreview({ src, alt, onClose, onDownload }: ImagePreviewProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fadeInSlow"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors z-10"
        aria-label="关闭预览"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Download button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDownload(); }}
        className="absolute top-4 right-16 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-2 z-10"
      >
        <Download className="h-4 w-4" />
        下载
      </button>

      {/* Image */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain shadow-2xl animate-scaleIn"
      />
    </div>
  );
}
