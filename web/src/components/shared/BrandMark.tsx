interface BrandMarkProps {
  className?: string;
  dark?: boolean;
}

export default function BrandMark({ className = "w-24", dark = false }: BrandMarkProps) {
  return (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      <svg viewBox="0 0 160 110" className={`w-full h-auto fill-current transition-colors ${dark ? 'text-zinc-900' : 'text-zinc-100'}`}>
        <defs>
          <filter id="herein-ink-bleed">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#herein-ink-bleed)">
          <text x="35" y="58" className="font-serif font-black" fontSize="48" letterSpacing="4">此</text>
          <text x="92" y="58" className="font-serif font-black" fontSize="48" letterSpacing="4">间</text>
          <text x="80" y="88" textAnchor="middle" className="font-serif tracking-[0.2em] font-bold" fontSize="17">HEREIN</text>
          <line x1="25" y1="102" x2="135" y2="102" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3,3" />
        </g>
      </svg>
    </div>
  );
}
