export default function ManifestoTab() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">The Manifesto / 品牌宣言书</span>
        <h2 className="text-4xl font-serif font-extralight tracking-wide text-white">《此间 HEREIN》是什么？</h2>
        <div className="h-0.5 w-16 bg-zinc-700 mx-auto mt-4" />
      </div>

      <div className="space-y-12 text-zinc-300 font-serif leading-relaxed text-base">
        {/* One-liner */}
        <div className="space-y-3">
          <p className="text-zinc-400 text-sm font-mono tracking-wider">用一句大众能听懂的话：</p>
          <div className="bg-zinc-900/40 p-6 rounded border border-zinc-800">
            <p className="text-zinc-500 line-through text-sm mb-1 font-sans">它不是教你"拍好看"。</p>
            <p className="text-lg text-white font-medium">它是：教你重新看见你正在生活的城市。</p>
          </div>
        </div>

        <div className="space-y-4">
          <p>很多人每天都在城市里经过：地铁、小区、菜市场、下班路、深夜便利店。</p>
          <p className="border-l-2 border-zinc-700 pl-4 italic text-zinc-400">幕后观察：人是"路过"的，不是"在场"的。</p>
          <p>《此间 HEREIN》做的事情，就是：把那些快被忽略掉的人间瞬间，重新留下来。</p>
        </div>

        {/* Is / Is Not */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="p-6 bg-zinc-950 rounded border border-zinc-900 space-y-4">
            <h4 className="text-base font-sans font-bold uppercase tracking-widest text-red-400/80 flex items-center gap-2">×《此间》不是什么？</h4>
            <ul className="space-y-3 text-sm text-zinc-400 font-sans">
              <li className="flex gap-2 items-start"><span className="text-zinc-700">·</span><span><strong>不是旅游攻略：</strong>不关心消费城市，不追求"打卡/出片/必去"。</span></li>
              <li className="flex gap-2 items-start"><span className="text-zinc-700">·</span><span><strong>不是高级滤镜：</strong>反对伪电影感、网红情绪、空镜堆砌和AI炫技。</span></li>
              <li className="flex gap-2 items-start"><span className="text-zinc-700">·</span><span><strong>不是文艺表演：</strong>不为了刻意表现孤独或高级而伪装。</span></li>
            </ul>
          </div>
          <div className="p-6 bg-amber-950/20 rounded border border-amber-900/30 space-y-4">
            <h4 className="text-base font-sans font-bold uppercase tracking-widest text-amber-200 flex items-center gap-2">✓《此间》真正做的是什么？</h4>
            <ul className="space-y-3 text-sm text-zinc-300 font-sans">
              <li className="flex gap-2 items-start"><span className="text-amber-500">·</span><span><strong>一套"城市观察系统"：</strong>训练你感知时间流动。</span></li>
              <li className="flex gap-2 items-start"><span className="text-amber-500">·</span><span><strong>空间里的情绪感知：</strong>捕捉空气、气味、和属于夜晚的微温。</span></li>
              <li className="flex gap-2 items-start"><span className="text-amber-500">·</span><span><strong>重新理解人间：</strong>把视野投向那些在生活、在等待、在疲惫、在沉默的具体人身上。</span></li>
            </ul>
          </div>
        </div>

        {/* AI Age */}
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <h3 className="text-xl text-white font-sans font-semibold">AI时代里的真实性</h3>
          <p className="text-sm text-zinc-400 font-sans leading-relaxed">
            为什么它会和现在大部分内容不一样？因为内容平台都在追"更快、更爆、更刺激"，而《此间》反着来。风吹动塑料袋、老人慢慢收摊、雨水从阳台滴下来、夜里还有一盏灯亮着……这些东西不会让你肾上腺素激增，但它会让你在嘈杂的世界里，突然安静下来。
          </p>
          <p className="text-base font-semibold text-amber-200 font-sans">AI能生成极其精致的画面，但人，仍然需要真实地活过。这就是《此间》的全部意义。</p>
        </div>
      </div>
    </div>
  );
}
