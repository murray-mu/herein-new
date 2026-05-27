import { useState, useEffect } from 'react';
import { MapPin, Radar, TrendingUp, Award, Globe } from 'lucide-react';
import BrandMark from '../shared/BrandMark';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import ErrorState from '../shared/ErrorState';

export default function PublicHomepage({ username }: { username: string }) {
  const [data, setData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, projectsRes] = await Promise.all([
          fetch(`/api/user/${username}`),
          fetch(`/api/user/${username}/projects`),
        ]);
        if (!profileRes.ok) throw new Error('User not found');
        setData(await profileRes.json());
        setProjects(await projectsRes.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12"><LoadingSkeleton className="h-96" /></div>;
  if (error) return <div className="max-w-6xl mx-auto px-4 py-12"><ErrorState message={error} /></div>;
  if (!data) return null;

  // Calculate city stats from projects
  const cityMap: Record<string, number> = {};
  projects.forEach((p: any) => {
    if (p.city) cityMap[p.city] = (cityMap[p.city] || 0) + 1;
  });

  const hereinCount = projects.filter((p: any) => Number(p.score_total) >= 36).length;

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 font-sans antialiased">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar + Brand */}
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">
                <BrandMark className="w-14" />
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">此间档案 · 数字资产陈列馆</p>
                <h1 className="text-3xl md:text-4xl font-serif font-extralight tracking-tight text-white mt-2">
                  {data.display_name || username}
                </h1>
                <p className="text-sm text-zinc-400 mt-1">@{username} · {data.city}</p>
              </div>

              {data.bio && <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">{data.bio}</p>}

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{data.total_archives}</p>
                  <p className="text-xs text-zinc-500">此间档案</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-300">{hereinCount}</p>
                  <p className="text-xs text-zinc-500">此间级 (≥36)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{data.avg_score}</p>
                  <p className="text-xs text-zinc-500">四维均分 /40</p>
                </div>
                {data.score_trend > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />↑{data.score_trend}%
                    </p>
                    <p className="text-xs text-zinc-500">能力趋势</p>
                  </div>
                )}
              </div>

              {/* City footprint */}
              {Object.keys(cityMap).length > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-xs text-zinc-500 flex items-center gap-1"><Globe className="h-3 w-3" />城市足迹</span>
                  {Object.entries(cityMap).map(([city, count]) => (
                    <span key={city} className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-amber-500" />
                      {city} · {count}份
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score Radar */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
            <Radar className="h-4 w-4 text-amber-400" />
            四维能力雷达
            <span className="text-xs text-zinc-400 font-normal ml-auto">均分 {data.avg_score}/40</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['时间维', data.avg_time_score, '捕捉时代脉搏与时间流动'], ['空间维', data.avg_space_score, '空间情绪与场景感知'], ['人间维', data.avg_human_score, '对人的观察与共情深度'], ['品味维', data.avg_taste_score, '审美判断与风格独特性']].map(([label, val, desc]) => (
              <div key={label as string} className="text-center space-y-2 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
                <p className="text-3xl font-bold text-white">{val}</p>
                <p className="text-xs text-zinc-400 font-medium">{label}</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{desc}</p>
                <div className="h-1.5 rounded-full bg-zinc-800 mt-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                    style={{ width: `${Number(val) * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Archives Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            此间档案 ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-16">暂无公开档案</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {projects.map((p: any) => (
                <div key={p.asset_id}
                  className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all group">
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                    {p.image_path ? (
                      <img src={p.image_path}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : p.generated_image_base64 ? (
                      <img src={`data:image/png;base64,${p.generated_image_base64}`}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BrandMark className="w-12 text-zinc-700" />
                      </div>
                    )}
                    {/* Score badge */}
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
                  {/* Info */}
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
                    {/* Mini scores */}
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/60 bg-zinc-950 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center space-y-3">
          <BrandMark className="w-12 mx-auto" />
          <p className="text-xs text-zinc-500">
            此间 HEREIN · 数字资产系统 v2.3 · 你记录此间，此间成为你的资产
          </p>
          <p className="text-[11px] text-zinc-600">
            © 2026 HEREIN. A Method of Reconnecting Man & City in the AI Era.
          </p>
        </div>
      </div>
    </div>
  );
}
