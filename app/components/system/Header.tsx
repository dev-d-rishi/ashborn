"use client";

import { useContext } from "react";
import { SystemContext } from "@/app/(app)/layout";

export default function Header() {
  const system = useContext(SystemContext);

  const rank = system?.user?.rank || "-";
  const discipline = system?.user?.discipline_score || 0;
  const alignment = system?.user?.alignment_score ?? system?.alignment_percent ?? 0;

  return (
    <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md z-50">
      <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="flex gap-8 items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/45 tracking-[0.2em] uppercase">
              Current Rank
            </span>
            <span className="text-sm font-bold tracking-widest text-white/90">
              RANK: {rank}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/45 tracking-[0.2em] uppercase">
              Discipline
            </span>
            <span className="text-sm font-light tracking-widest">{discipline}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/45 tracking-[0.2em] uppercase">
              Alignment
            </span>
            <span className="text-sm font-light tracking-widest text-white/60">
              {alignment}%
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono tracking-[0.4em] text-white/55 uppercase">
            Day 1 of Ascent
          </span>
        </div>
      </div>
    </nav>
  );
}
