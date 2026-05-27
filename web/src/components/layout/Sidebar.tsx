import { MapPin, Sparkles, BookOpen, FileText, Archive, Images, LogOut } from 'lucide-react';
import BrandMark from '../shared/BrandMark';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  username: string;
  onLogout: () => void;
}

const tabs = [
  { id: 'experience', label: '视角转换体验', icon: MapPin },
  { id: 'generator', label: '记忆卡片与提示词', icon: Sparkles },
  { id: 'practice', label: '五维感官训练', icon: BookOpen },
  { id: 'gallery', label: '我的图库', icon: Images },
  { id: 'manifesto', label: '此间宣言书', icon: FileText },
  { id: 'asset', label: '我的此间资产', icon: Archive },
];

export default function Sidebar({ activeTab, onTabChange, username, onLogout }: SidebarProps) {
  return (
    <aside className="w-60 h-screen sticky top-0 flex flex-col bg-[#0f0f10] border-r border-zinc-800/60 px-4 py-6 hidden lg:flex">
      <div className="flex flex-col items-center gap-3 pb-6 border-b border-zinc-800/40">
        <BrandMark className="w-16" />
        <div className="text-center">
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 block uppercase">此间 HEREIN</span>
          <p className="text-[11px] text-zinc-500 tracking-wider mt-0.5">城市观察系统</p>
        </div>
        <p className="text-xs text-zinc-500 truncate max-w-full">{username}</p>
      </div>

      <nav className="flex-1 py-6 space-y-1" aria-label="Main navigation">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                active
                  ? 'bg-amber-950/20 border border-amber-900/30 text-amber-200'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              <span className="text-xs font-medium leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-zinc-800/40 space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          退出登录
        </button>
        <p className="text-[11px] text-zinc-600 text-center">© 2026 HEREIN</p>
      </div>
    </aside>
  );
}
