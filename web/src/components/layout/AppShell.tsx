import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';

interface AppShellProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
  username: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function AppShell({ activeTab, onTabChange, children, username, isAdmin, onLogout }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#121212] text-zinc-100 font-sans antialiased selection:bg-zinc-700 selection:text-white">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} username={username} isAdmin={isAdmin} onLogout={onLogout} />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0" id="main-content">
        {children}
      </main>
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
