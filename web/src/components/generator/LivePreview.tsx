import BrandMark from '../shared/BrandMark';

interface LivePreviewProps {
  cardType: string;
  sceneTitle: string;
  city: string;
  timePeriod: string;
  sceneDetails: string[];
}

export default function LivePreview({ cardType, sceneTitle, city, timePeriod, sceneDetails }: LivePreviewProps) {
  if (cardType === 'cover') {
    return (
      <div className="w-full max-w-[280px] aspect-[3/4] bg-[#161617] p-8 rounded-none border border-zinc-800 text-zinc-300 relative overflow-hidden flex flex-col justify-between shadow-lg mx-auto">
        <div className="flex justify-center border-b border-zinc-900 pb-3">
          <BrandMark className="w-16" />
        </div>
        <div className="my-auto space-y-4">
          <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase block">VOLUME 01 // 创刊号</span>
          <h5 className="text-2xl font-serif text-white tracking-wide leading-snug">{sceneTitle || '（未输入场景）'}</h5>
          <div className="h-0.5 w-8 bg-amber-500/80" />
        </div>
        <div className="pt-4 border-t border-zinc-900 flex flex-col gap-2">
          <p className="text-sm font-serif text-amber-200 tracking-wider">" 封存不可复制的现场 "</p>
          <div className="flex justify-between items-baseline text-[11px] font-mono text-zinc-500 uppercase">
            <span>地点: {city || '此间城市'}</span>
            <span>{timePeriod || '此时此刻'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (cardType === 'back') {
    return (
      <div className="w-full max-w-[280px] aspect-[3/4] bg-[#121213] p-8 rounded-none border border-zinc-800 text-zinc-300 relative overflow-hidden flex flex-col justify-between shadow-lg mx-auto">
        <div className="text-center py-2 border-b border-zinc-900">
          <span className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">THE ENDING OF JOURNEY</span>
        </div>
        <div className="my-auto text-center space-y-6 px-2">
          <div className="opacity-80 flex justify-center">
            <BrandMark className="w-24 text-zinc-200" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-serif leading-relaxed text-zinc-300 text-center">
              " 让每一座城、每一个人都拥有一段属于自己的此间。 "
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-900 text-center space-y-1">
          <p className="text-[11px] font-mono text-zinc-600 uppercase">A Method of Reconnecting Man & City in the AI Era.</p>
        </div>
      </div>
    );
  }

  // content card (default)
  return (
    <div className="w-full max-w-[280px] aspect-[3/4] bg-[#151516] p-7 rounded-none border border-zinc-800 text-zinc-300 relative overflow-hidden flex flex-col justify-between shadow-lg mx-auto">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
        <div className="transform -translate-x-3 scale-[0.65] origin-left">
          <BrandMark className="w-16" />
        </div>
        <span className="text-[11px] font-mono text-zinc-500 uppercase">{city} // {timePeriod}</span>
      </div>
      <div className="space-y-3 my-auto flex-grow pt-4 z-10">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase block">OBSERVED / 场景痕迹</span>
          <h5 className="text-base font-semibold text-zinc-100 font-serif">{sceneTitle || '（未输入场景）'}</h5>
        </div>
        <ul className="space-y-2.5 pt-2">
          {sceneDetails.map((detail, idx) => (
            <li key={idx} className="flex gap-2 text-sm leading-relaxed text-zinc-300 items-start">
              <span className="text-amber-500 font-mono text-xs leading-none mt-0.5">•</span>
              <span>{detail}</span>
            </li>
          ))}
          {sceneDetails.length === 0 && (
            <li className="text-sm text-zinc-600 italic">在左侧采集现场细节，让正文逐渐饱满...</li>
          )}
        </ul>
      </div>
      <div className="absolute right-0 bottom-12 opacity-[0.06] pointer-events-none transform rotate-12 scale-110">
        <BrandMark className="w-32" />
      </div>
      <div className="pt-3 border-t border-zinc-900/80 flex justify-between items-center text-[11px] font-mono text-zinc-500 z-10">
        <div>
          <p className="tracking-widest font-bold text-zinc-400">《此间 HEREIN》正页</p>
          <p className="text-[11px] text-zinc-600">我真实活过的证据</p>
        </div>
        <span className="text-[11px] text-zinc-500">{timePeriod}</span>
      </div>
    </div>
  );
}
