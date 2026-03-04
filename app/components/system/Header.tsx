"use client";

export default function Header() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-white/5 bg-black/50 backdrop-blur-md z-50">
      <div className="flex gap-8 items-center">
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-white/45 tracking-[0.2em] uppercase">
            Current Rank
          </span>
          <span className="text-sm font-bold tracking-widest text-white/90">
            RANK: E
          </span>
        </div>
        <div className="h-6 w-[1px] bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-white/45 tracking-[0.2em] uppercase">
            Discipline
          </span>
          <span className="text-sm font-light tracking-widest">41%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-white/45 tracking-[0.2em] uppercase">
            Alignment
          </span>
          <span className="text-sm font-light tracking-widest text-white/60">
            23%
          </span>
        </div>
      </div>

      <div className="text-right">
        <span className="text-[10px] font-mono tracking-[0.4em] text-white/55 uppercase">
          Day 1 of Ascent
        </span>
      </div>
    </nav>
  );
}
