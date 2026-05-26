interface ContentFormProps {
  city: string;
  timePeriod: string;
  sceneTitle: string;
  sceneDetails: string[];
  newDetail: string;
  onCityChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onNewDetailChange: (v: string) => void;
  onAddDetail: () => void;
  onRemoveDetail: (i: number) => void;
  onLoadTemplate: () => void;
  onReset: () => void;
}

export default function ContentForm({
  city, timePeriod, sceneTitle, sceneDetails, newDetail,
  onCityChange, onTimeChange, onTitleChange, onNewDetailChange,
  onAddDetail, onRemoveDetail, onLoadTemplate, onReset,
}: ContentFormProps) {
  return (
    <div className="space-y-5">
      {/* City + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">城市/地点</label>
          <input
            type="text"
            value={city}
            onChange={e => onCityChange(e.target.value)}
            placeholder="大连"
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">时间</label>
          <input
            type="text"
            value={timePeriod}
            onChange={e => onTimeChange(e.target.value)}
            placeholder="夜里11点"
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Scene title */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400">场景主题</label>
        <input
          type="text"
          value={sceneTitle}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="下班后的便利店"
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      {/* Details */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-400 block">采集瞬间痕迹 ({sceneDetails.length}/6)</label>
        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
          {sceneDetails.map((d, i) => (
            <div key={i} className="flex gap-2 items-center bg-zinc-950 px-3 py-2 rounded border border-zinc-800/80 text-sm">
              <span className="text-zinc-600 font-mono text-[11px]">{i + 1}</span>
              <span className="text-zinc-300 flex-grow leading-relaxed">{d}</span>
              <button onClick={() => onRemoveDetail(i)} className="text-zinc-500 hover:text-red-400 transition-colors px-1 min-h-[44px] flex items-center" aria-label="删除此细节">
                ×
              </button>
            </div>
          ))}
        </div>

        {sceneDetails.length < 6 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newDetail}
              onChange={e => onNewDetailChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAddDetail()}
              placeholder="添加具体、微小的现实细节..."
              className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600"
            />
            <button
              onClick={onAddDetail}
              className="px-3 py-2 bg-zinc-200 hover:bg-white text-zinc-950 text-xs font-bold rounded shrink-0 min-h-[44px]"
            >
              添加
            </button>
          </div>
        )}
      </div>

      {/* Template + Reset */}
      <div className="pt-3 border-t border-zinc-800 flex gap-2">
        <button onClick={onLoadTemplate} className="flex-1 py-2 rounded border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-400 transition-colors min-h-[44px]">
          导入经典《此间》模版
        </button>
        <button onClick={onReset} className="px-3 py-2 rounded border border-zinc-800 hover:bg-zinc-800 text-xs font-medium text-zinc-400 transition-colors min-h-[44px]">
          重置
        </button>
      </div>
    </div>
  );
}
