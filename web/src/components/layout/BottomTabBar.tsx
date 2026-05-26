import { MapPin, Sparkles, BookOpen, FileText } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'experience', label: '体验', icon: MapPin },
  { id: 'generator', label: '卡片', icon: Sparkles },
  { id: 'practice', label: '训练', icon: BookOpen },
  { id: 'manifesto', label: '宣言', icon: FileText },
];

export default function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f10]/95 backdrop-blur-md border-t border-zinc-800/60 safe-area-bottom" aria-label="Mobile navigation">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-0 px-2 py-1 rounded-lg transition-colors min-h-[44px] ${
                active ? 'text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-amber-400' : ''}`} />
              <span className="text-[11px] font-medium truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
