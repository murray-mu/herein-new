import { useState } from 'react';
import { MapPin, Clock, Info, ChevronRight, Sparkles } from 'lucide-react';
import { observationScenes } from '../../constants/scenes';
import FirstVisitHint, { dismissFirstVisitHint } from './FirstVisitHint';

interface ExperienceTabProps {
  onMakeCard: (title: string, details: string[], city: string, time: string) => void;
}

export default function ExperienceTab({ onMakeCard }: ExperienceTabProps) {
  const [selectedScene, setSelectedScene] = useState(0);
  const [isPresentView, setIsPresentView] = useState(false);
  const scene = observationScenes[selectedScene];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">Core Experience / 核心体验</span>
        <h2 className="text-3xl md:text-4xl font-serif font-extralight tracking-tight text-white">
          你每天是在 <span className="font-normal border-b border-zinc-700 italic px-1">路过</span> 城市，还是 <span className="font-normal text-amber-200 border-b border-amber-800/80 italic px-1">在场</span> 感受？
        </h2>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl">
          《此间 HEREIN》不教你拍摄"好看的爆款景点"，而是训练你像雷达般捕获那些正在被忽略的人间微芒。
        </p>
      </div>

      <FirstVisitHint />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scene list */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase block">选择观察场景</span>
          <div className="space-y-3">
            {observationScenes.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => { setSelectedScene(idx); setIsPresentView(false); }}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center justify-between ${
                  selectedScene === idx
                    ? 'bg-zinc-900 border-zinc-600 text-white shadow-lg shadow-black/30'
                    : 'bg-transparent border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
                aria-pressed={selectedScene === idx}
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    {s.title}
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <span>{s.location}</span>
                    <span>·</span>
                    <span>{s.time}</span>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${selectedScene === idx ? 'translate-x-1 text-amber-200' : 'text-zinc-600'}`} />
              </button>
            ))}
          </div>

          <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800/60 space-y-2.5">
            <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
              <Info className="h-3.5 w-3.5 text-amber-400/80" />
              什么是"在场感"？
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              大部分时候我们通过手机屏幕或"打卡"来消费城市。而在场感，是闭上眼睛能听见晚风的声音、能看到雨后亮起的一扇窗。
            </p>
          </div>
        </div>

        {/* Observer panel */}
        <div className="lg:col-span-8 bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden shadow-2xl">
          <div className="bg-zinc-900 px-6 py-3 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
            <div className="flex items-center gap-2 font-mono">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span>OBSERVER_MODE_STABLE</span>
            </div>
            <div className="font-mono flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{scene.time}</span>
            </div>
          </div>

          <div className="relative min-h-[320px] md:min-h-[380px] p-8 flex flex-col justify-between transition-colors duration-500"
            style={{
              background: isPresentView
                ? 'radial-gradient(circle at center, #1b1a16 0%, #0d0c0a 100%)'
                : 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)'
            }}
          >
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-zinc-800/60 pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-zinc-800/60 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-zinc-800/60 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-zinc-800/60 pointer-events-none" />

            <div className="self-end px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
              {scene.location}
            </div>

            <div className="my-auto max-w-xl mx-auto text-center space-y-6 py-6">
              <div className="space-y-2">
                <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                  {isPresentView ? "《此间》视角 - 在场观察" : "普通视角 - 浮光掠影"}
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-light leading-snug tracking-wide text-white">
                  {isPresentView
                    ? `" ${scene.herein.visual} "`
                    : `" 以前你看到：${scene.ordinary.visual} "`
                  }
                </h3>
              </div>

              <div className="inline-flex flex-wrap justify-center gap-3 text-[11px] font-mono">
                <span className={`px-2 py-1 rounded transition-colors ${isPresentView ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50' : 'bg-zinc-900 text-zinc-400'}`}>
                  关注焦点: {isPresentView ? scene.herein.focus : scene.ordinary.focus}
                </span>
                <span className={`px-2 py-1 rounded transition-colors ${isPresentView ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50' : 'bg-zinc-900 text-zinc-400'}`}>
                  空间情绪: {isPresentView ? scene.herein.mood : scene.ordinary.mood}
                </span>
              </div>
            </div>

            {/* Perspective toggle */}
            <div className="w-full max-w-md mx-auto pt-4 border-t border-zinc-900/80">
              <div className="flex justify-between text-xs text-zinc-500 font-medium mb-2.5">
                <span className={!isPresentView ? 'text-zinc-300' : ''}>路过 (无感)</span>
                <span className={isPresentView ? 'text-amber-300 font-bold' : ''}>在场 (看见生命)</span>
              </div>
              <div className="relative flex items-center justify-between bg-zinc-900 rounded-full p-1.5 border border-zinc-800">
                <button
                  onClick={() => setIsPresentView(false)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all min-h-[44px] ${!isPresentView ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  aria-pressed={!isPresentView}
                >
                  普通观察
                </button>
                <button
                  onClick={() => { setIsPresentView(true); dismissFirstVisitHint(); }}
                  className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1 min-h-[44px] ${isPresentView ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-900/20' : 'text-zinc-500 hover:text-amber-300'}`}
                  aria-pressed={isPresentView}
                >
                  <Sparkles className="h-3 w-3" />
                  开启《此间》视角
                </button>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div className="bg-zinc-900/60 px-6 py-4 border-t border-zinc-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">观察练习：</span>
              {isPresentView ? "你看见了时间流动，空气中的温度被写进了生活的旁白里。" : "试着打开《此间》视角，捕捉微风、雨滴和具体的人。"}
            </div>
            <button
              onClick={() => {
                const chunks = scene.herein.visual.split('。').filter(Boolean);
                onMakeCard(scene.title, chunks, scene.location.split(' ')[0], scene.time);
              }}
              className="text-xs font-semibold text-amber-200 hover:text-amber-100 transition-colors flex items-center gap-1 self-end md:self-auto shrink-0 min-h-[44px]"
            >
              以此场景制作城市卡片
              <span className="text-amber-400">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="p-8 border border-zinc-800 rounded-xl bg-gradient-to-r from-zinc-950 via-[#161616] to-[#0c0c0d] text-center max-w-4xl mx-auto space-y-3">
        <p className="text-base md:text-lg font-serif font-extralight text-zinc-300 italic">
          " 真正的《此间》强调的是：真实。甚至有时候，真实比'漂亮'更重要。 "
        </p>
        <div className="h-px w-12 bg-zinc-700 mx-auto" />
        <p className="text-xs font-mono text-zinc-500">—— 《此间 HEREIN》</p>
      </div>
    </div>
  );
}
