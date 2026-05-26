import { useState } from 'react';
import AppShell from './components/layout/AppShell';
import ExperienceTab from './components/experience/ExperienceTab';
import GeneratorTab from './components/generator/GeneratorTab';
import PracticeTab from './components/practice/PracticeTab';
import ManifestoTab from './components/manifesto/ManifestoTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('experience');

  // Bridge state: when user clicks "make card from this scene" in experience tab
  const [generatorPreset, setGeneratorPreset] = useState({
    title: '下班后的便利店',
    details: [
      '手里捏着一张刚打印的发票',
      '冷柜散发着白色雾气',
      '关东煮的汤汁咕嘟咕嘟响',
      '收银员正在小声打着哈欠',
      '门外霓虹灯在积水里碎成一地金黄'
    ],
    city: '大连',
    time: '夜里11点'
  });

  // Practice progress — persisted in localStorage
  const [practiceProgress, setPracticeProgress] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('herein-practice-progress');
      return saved ? JSON.parse(saved) : { 1: false, 2: false, 3: false, 4: false, 5: false };
    } catch {
      return { 1: false, 2: false, 3: false, 4: false, 5: false };
    }
  });

  const handleTogglePractice = (id: number) => {
    const next = { ...practiceProgress, [id]: !practiceProgress[id] };
    setPracticeProgress(next);
    localStorage.setItem('herein-practice-progress', JSON.stringify(next));
  };

  const handleMakeCard = (title: string, details: string[], city: string, time: string) => {
    setGeneratorPreset({ title, details, city, time });
    setActiveTab('generator');
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'experience' && (
        <ExperienceTab onMakeCard={handleMakeCard} />
      )}
      {activeTab === 'generator' && (
        <GeneratorTab
          key={generatorPreset.title + generatorPreset.time}
          initialTitle={generatorPreset.title}
          initialDetails={generatorPreset.details}
          initialCity={generatorPreset.city}
          initialTime={generatorPreset.time}
        />
      )}
      {activeTab === 'practice' && (
        <PracticeTab progress={practiceProgress} onToggle={handleTogglePractice} />
      )}
      {activeTab === 'manifesto' && (
        <ManifestoTab />
      )}
    </AppShell>
  );
}
