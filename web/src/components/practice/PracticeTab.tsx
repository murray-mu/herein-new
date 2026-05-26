import { Check } from 'lucide-react';

interface PracticeTabProps {
  progress: Record<number, boolean>;
  onToggle: (id: number) => void;
}

const practices: Record<number, { title: string; desc: string; task: string; tag: string }> = {
  1: {
    title: '重新拥有观察力',
    desc: '不再用眼睛“扫视”城市，而是盯着光线和特定的人。',
    task: '观察离你最近的正在工作的人（保洁、外卖员、收银员），记住并写下他身上的 3 个微小特征。',
    tag: '对抗“感知力退化”'
  },
  2: {
    title: '建立个人真实审美',
    desc: '打破社交平台的流行公式，知道什么是真实的，什么是空洞的网红套路。',
    task: '找到一处不完美甚至是旧旧的街道角落，拍下一张照片，不添加任何滤镜，寻找它生命力的体现。',
    tag: '摆脱“平台审美绑架”'
  },
  3: {
    title: '沉淀个人城市记忆',
    desc: '用时间记录你曾在大地上生活过的铁证，把回忆锚定在具体的风、雨、天光上。',
    task: '记下你今天下班（或放学）经过某段路时的空气温度和迎面走过的人。存入本地日志中。',
    tag: '书写“我真实活过的证据”'
  },
  4: {
    title: '形成个人内容风格',
    desc: '不当模版流水线。你的城市、你的观察、你的时间，这才是你无可替代的气质。',
    task: '撰写一段没有任何网络热梗的随笔。只描述名词、光影变化和你的具体触觉，不超过80字。',
    tag: '消除“机器克隆感”'
  },
  5: {
    title: '重建“在场感”',
    desc: '退出焦虑的无限信息刷屏。从网络断联片刻，重新退回到“此时此地”。',
    task: '出门散步20分钟，期间不允许掏出手机看任何消息或拍照。纯粹用耳朵、眼睛去吸收当下的喧嚣。',
    tag: '逃出“一直在线”的牢笼'
  },
};

export default function PracticeTab({ progress, onToggle }: PracticeTabProps) {
  const completed = Object.values(progress).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 animate-fadeIn">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Observer Growth / 观察力重建</span>
        <h2 className="text-3xl font-serif font-extralight tracking-tight text-white">用《此间》重建生命感知的 5 个练习</h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          《此间》不是简单的滤镜，而是在AI时代重新找回人与城市关系的练习系统。
        </p>
      </div>

      {completed === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-zinc-500">开始你的第一项感知训练 ↓</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map(num => {
          const p = practices[num];
          const done = progress[num];
          return (
            <div key={num} className={`p-6 rounded-xl border transition-all ${done ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-zinc-900/40 border-zinc-800'} flex flex-col justify-between space-y-6`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-8 w-8 rounded bg-zinc-800 flex items-center justify-center text-[11px] text-amber-300 font-mono">0{num}</div>
                  <button
                    onClick={() => onToggle(num)}
                    role="checkbox"
                    aria-checked={done}
                    className={`h-7 px-2.5 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors min-h-[44px] ${
                      done ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {done && <Check className="h-3.5 w-3.5" />}
                    {done ? '已完成' : '标记完成'}
                  </button>
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-white">{p.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
                </div>
                <div className="p-3 bg-zinc-950 rounded border border-zinc-900 space-y-1.5">
                  <span className="text-[11px] font-mono text-amber-500 block uppercase font-bold">今日练习任务:</span>
                  <p className="text-sm text-zinc-300">{p.task}</p>
                </div>
              </div>
              <div className="text-[11px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-3 min-h-[44px] flex items-center">
                训练：{p.tag}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/20 max-w-xl mx-auto text-center space-y-3">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block font-bold">在场感知训练进度</span>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map(num => (
            <div key={num}
              className={`h-2.5 w-12 rounded-full transition-all duration-300 ${progress[num] ? 'bg-amber-400' : 'bg-zinc-800'}`}
            />
          ))}
        </div>
        <p className="text-sm text-zinc-500">
          {completed === 5
            ? '在场本能已全部激活！'
            : `你已激活 ${completed} / 5 项在场本能`
          }
        </p>
      </div>
    </div>
  );
}
