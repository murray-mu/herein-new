import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';

interface AppShellProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}

export default function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#121212] text-zinc-100 font-sans antialiased selection:bg-zinc-700 selection:text-white">
      {/* Desktop sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0" id="main-content">
        {children}
      </main>

      {/* Mobile bottom bar */}
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
