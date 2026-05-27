import { useState, useEffect } from 'react';
import {
  Archive, TrendingUp, MapPin, Award, Wallet, ExternalLink,
  Layers, Gem, Briefcase, Radar
} from 'lucide-react';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import ErrorState from '../shared/ErrorState';

interface AssetData {
  user: { id: number; username: string; display_name: string; city: string; bio: string; homepage_url: string };
  asset_summary: { total_archives: number; herein_tier: number; minted: number; cities: string[]; series: any[] };
  scores: { avg_total: number; time: number; space: number; human: number; taste: number; trend: number };
  city_partner: { cities: string[]; qualified: boolean };
  asset_value: { collectible_cards: number; cards_for_sale: number; b_services_available: number; copyright_licensable: number };
  recent_projects: any[];
  city_stats: any[];
  cards: any[];
}

interface AssetPanelProps {
  userId: number;
  token: string;
}

export default function AssetPanel({ userId, token }: AssetPanelProps) {
  const [data, setData] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/asset/panel/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load');
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, token]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-8"><LoadingSkeleton className="h-96" /></div>;
  if (error) return <div className="max-w-6xl mx-auto px-4 py-8"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!data) return null;

  const { scores, asset_summary, city_partner, asset_value, recent_projects } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Digital Asset System / 数字资产系统</span>
        <h2 className="text-3xl font-serif font-extralight tracking-tight text-white flex items-center gap-3">
          <Archive className="h-7 w-7 text-amber-400" />
          我的此间资产
        </h2>
      </div>

      {/* Four-Layer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Layer 1 — Identity */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-950/40 border border-blue-900/30">
              <Layers className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-xs font-bold text-blue-300">Layer 1 · 身份资产</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{asset_summary.total_archives}</p>
            <p className="text-xs text-zinc-400">份此间档案</p>
            <div className="flex items-center gap-1 text-xs text-amber-300">
              <Award className="h-3 w-3" />
              <span>此间级 (≥36) · {asset_summary.herein_tier} 份</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {asset_summary.cities.map((c: string) => (
              <span key={c} className="px-2 py-0.5 rounded-full bg-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />{c}
              </span>
            ))}
          </div>
        </div>

        {/* Layer 2 — Capability */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-900/30">
              <Radar className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-emerald-300">Layer 2 · 能力资产</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">{scores.avg_total}<span className="text-sm text-zinc-400">/40</span></p>
            <p className="text-xs text-zinc-400">四维均分</p>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center text-[11px]">
            {[['时间', scores.time], ['空间', scores.space], ['人间', scores.human], ['品味', scores.taste]].map(([label, val]) => (
              <div key={label as string} className="bg-zinc-800/50 rounded py-1.5">
                <p className="text-white font-bold">{val}</p>
                <p className="text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
          {scores.trend !== 0 && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>趋势 ↑{scores.trend}%</span>
            </div>
          )}
        </div>

        {/* Layer 3 — Portfolio */}
        <div className={`bg-zinc-900/60 border rounded-xl p-5 space-y-3 ${city_partner.qualified ? 'border-amber-700/60' : 'border-zinc-800'}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${city_partner.qualified ? 'bg-amber-950/40 border border-amber-900/30' : 'bg-zinc-800/40'}`}>
              <Briefcase className={`h-4 w-4 ${city_partner.qualified ? 'text-amber-400' : 'text-zinc-500'}`} />
            </div>
            <span className={`text-xs font-bold ${city_partner.qualified ? 'text-amber-300' : 'text-zinc-500'}`}>Layer 3 · 组合资产</span>
          </div>
          <div className="space-y-1">
            <p className={`text-lg font-bold ${city_partner.qualified ? 'text-amber-300' : 'text-zinc-500'}`}>
              {city_partner.qualified ? `城市合伙人 · ${city_partner.cities.join(' ')}` : '积累中...'}
            </p>
            <p className="text-xs text-zinc-400">
              {city_partner.qualified ? 'Portfolio已自动生成' : `需8份同城档案+1个B端案例`}
            </p>
          </div>
        </div>

        {/* Layer 4 — Trade */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-purple-950/40 border border-purple-900/30">
              <Gem className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-xs font-bold text-purple-300">Layer 4 · 交易资产</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">收藏卡可售</span>
              <span className="text-white font-bold">{asset_value.collectible_cards} 张 × ¥899</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">B端服务</span>
              <span className={city_partner.qualified ? 'text-white font-bold' : 'text-zinc-600'}>{city_partner.qualified ? '资质已达标' : '待解锁'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">版权可授权</span>
              <span className="text-white font-bold">{asset_value.copyright_licensable} 份</span>
            </div>
          </div>
          {data.user.homepage_url && (
            <a href={`https://${data.user.homepage_url}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors">
              <ExternalLink className="h-3 w-3" />
              我的此间主页
            </a>
          )}
        </div>
      </div>

      {/* Recent Archives + Score Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Radar */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Radar className="h-4 w-4 text-amber-400" />
            四维能力雷达
            {scores.trend > 0 && (
              <span className="text-[11px] text-emerald-400 ml-auto flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />↑{scores.trend}%
              </span>
            )}
          </h4>
          <div className="space-y-4">
            {[['时间维', scores.time, 9.2], ['空间维', scores.space, 8.8], ['人间维', scores.human, 9.4], ['品味维', scores.taste, 8.7]].map(([label, val]) => (
              <div key={label as string} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{label}</span>
                  <span className="text-white font-mono font-bold">{val}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                    style={{ width: `${Number(val) * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Archive className="h-4 w-4 text-amber-400" />
            最近档案
          </h4>
          <div className="space-y-3">
            {recent_projects.slice(0, 5).map((p: any) => (
              <div key={p.asset_id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-mono text-amber-300 shrink-0">{p.asset_id}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate font-medium">{p.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                      <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.city}</span>
                      <span>{p.time_period}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className={`text-xs font-bold font-mono ${Number(p.score_total) >= 36 ? 'text-amber-300' : 'text-zinc-400'}`}>
                    {p.score_total}
                  </span>
                  {p.is_collectible && <span className="block text-[10px] text-purple-400">收藏卡</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Value Bottom */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 space-y-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Wallet className="h-4 w-4 text-amber-400" />
          资产价值概览
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-1">
            <p className="text-2xl font-bold text-white">{asset_value.collectible_cards}</p>
            <p className="text-xs text-zinc-400">收藏卡</p>
            <p className="text-[11px] text-amber-400 font-medium">¥{asset_value.collectible_cards * 899}</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-1">
            <p className="text-2xl font-bold text-white">{city_partner.qualified ? '✓' : '—'}</p>
            <p className="text-xs text-zinc-400">B端资质</p>
            <p className="text-[11px] text-zinc-500">{city_partner.qualified ? '¥5k-15k/项' : '待达标'}</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-1">
            <p className="text-2xl font-bold text-white">{asset_value.copyright_licensable}</p>
            <p className="text-xs text-zinc-400">版权授权</p>
            <p className="text-[11px] text-zinc-500">可用档案</p>
          </div>
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60 space-y-1">
            <p className="text-lg font-bold text-white truncate">{data.user.homepage_url || '未设置'}</p>
            <p className="text-xs text-zinc-400">此间主页</p>
            <a href={`https://${data.user.homepage_url}`} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1">
              <ExternalLink className="h-2.5 w-2.5" />访问
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
