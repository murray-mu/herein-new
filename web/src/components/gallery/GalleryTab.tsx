import { useState, useEffect } from 'react';
import { MapPin, Images, X, Download, MessageSquareText } from 'lucide-react';
import BrandMark from '../shared/BrandMark';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import ErrorState from '../shared/ErrorState';

interface Project {
  asset_id: string;
  title: string;
  city: string;
  time_period: string;
  card_type: string;
  score_total: number;
  score_time: number;
  score_space: number;
  score_human: number;
  score_taste: number;
  generated_image_base64: string | null;
  image_path: string | null;
  ai_prompt_en: string | null;
  ai_prompt_cn: string | null;
  is_collectible: boolean;
  collectible_price: number | null;
  minted_at: string;
  is_public: boolean;
}

interface Props {
  token: string;
}

function getImageUrl(p: Project): string | null {
  if (p.image_path) return p.image_path;
  if (p.generated_image_base64) return `data:image/png;base64,${p.generated_image_base64}`;
  return null;
}

export default function GalleryTab({ token }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/projects/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load');
        setProjects(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null);
    }
    if (selected) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selected]);

  function handleDownload(p: Project) {
    const imgUrl = getImageUrl(p);
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `herein-${p.asset_id}-${p.title}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-8"><LoadingSkeleton className="h-96" /></div>;
  if (error) return <div className="max-w-6xl mx-auto px-4 py-8"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 animate-fadeIn">
      <div className="space-y-2">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">My Gallery / 我的图库</span>
        <h2 className="text-3xl font-serif font-extralight tracking-tight text-white flex items-center gap-3">
          <Images className="h-7 w-7 text-amber-400" />
          我的图库
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <BrandMark className="w-16 mx-auto text-zinc-700" />
          <p className="text-sm text-zinc-500">还没有生成任何图片</p>
          <p className="text-xs text-zinc-600">切换到"记忆卡片与提示词"标签开始创作</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => {
            const imgUrl = getImageUrl(p);
            return (
              <div key={p.asset_id}
                className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all group cursor-pointer"
                onClick={() => setSelected(p)}>
                <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                  {imgUrl ? (
                    <img src={imgUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BrandMark className="w-12 text-zinc-700" />
                    </div>
                  )}
                  {p.score_total && (
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-mono font-bold
                      ${Number(p.score_total) >= 36 ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900/80 text-zinc-300'}`}>
                      {p.score_total}
                    </div>
                  )}
                  {p.is_collectible && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-purple-500/90 text-[10px] font-bold text-white">
                      收藏卡 ¥{p.collectible_price}
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-amber-300">{p.asset_id}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{p.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.city}</span>
                    <span>·</span>
                    <span>{p.time_period}</span>
                  </div>
                  <div className="flex gap-2 text-[10px] pt-1">
                    {['时间','空间','人间','品味'].map((dim, i) => {
                      const vals = [p.score_time, p.score_space, p.score_human, p.score_taste];
                      return (
                        <span key={dim} className="px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-400">
                          {dim} {vals[i]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(selected); }}
            className="absolute top-4 right-16 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-2 z-10"
          >
            <Download className="h-4 w-4" />
            下载
          </button>

          <div
            className="flex flex-col md:flex-row gap-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="md:w-1/2 shrink-0">
              {getImageUrl(selected) ? (
                <img
                  src={getImageUrl(selected)!}
                  alt={selected.title}
                  className="w-full rounded-lg object-contain max-h-[80vh]"
                />
              ) : (
                <div className="aspect-[3/4] bg-zinc-900 rounded-lg flex items-center justify-center">
                  <BrandMark className="w-16 text-zinc-700" />
                </div>
              )}
            </div>

            {/* Info + Prompts */}
            <div className="md:w-1/2 space-y-4 text-sm">
              <div>
                <span className="text-[11px] font-mono text-amber-300">{selected.asset_id}</span>
                <h3 className="text-xl font-serif font-extralight text-white mt-1">{selected.title}</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{selected.city}</span>
                  <span>·</span>
                  <span>{selected.time_period}</span>
                  <span>·</span>
                  <span className="font-mono text-zinc-500">总分 {selected.score_total}</span>
                </div>
              </div>

              {/* Mini scores */}
              <div className="flex gap-2 text-[11px]">
                {[
                  ['时间维', selected.score_time],
                  ['空间维', selected.score_space],
                  ['人间维', selected.score_human],
                  ['品味维', selected.score_taste],
                ].map(([label, val]) => (
                  <span key={label as string} className="px-2 py-1 rounded bg-zinc-800/50 text-zinc-300">
                    {label} <span className="font-bold text-white">{val}</span>
                  </span>
                ))}
              </div>

              {/* Prompts */}
              {(selected.ai_prompt_en || selected.ai_prompt_cn) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <MessageSquareText className="h-3.5 w-3.5 text-amber-400" />
                    生成提示词
                  </h4>
                  {selected.ai_prompt_en && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">English Prompt</span>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 rounded-lg p-3 border border-zinc-800">
                        {selected.ai_prompt_en}
                      </p>
                    </div>
                  )}
                  {selected.ai_prompt_cn && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">中文提示词</span>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 rounded-lg p-3 border border-zinc-800">
                        {selected.ai_prompt_cn}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Download button (mobile) */}
              <button
                onClick={() => handleDownload(selected)}
                className="md:hidden w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                下载图片
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
