"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

export default function ProgressScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return router.push("/");
      
      try {
        const res = await apiClient(`/system/progress/${userId}`);
        setData(res);
      } catch (err) {
        console.error("Progress fetch failed", err);
      }
    };
    fetchProgress();
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center font-mono text-sm">
        Aggregating system history...
      </div>
    );
  }

  // Calculate max values for bar charts smoothly
  const maxXP = Math.max(...data.graph_data.map((d: any) => d.xp_gained), 1);
  const maxDiscipline = Math.max(...data.graph_data.map((d: any) => d.discipline), 1);

  return (
    <div className="min-h-screen text-white font-sans flex flex-col pt-12 pb-24">
      <main className="flex-1 max-w-5xl w-full mx-auto px-8 gap-16 overflow-y-auto custom-scrollbar">
        <header className="mb-12">
          <h2 className="text-xs font-mono tracking-[0.5em] text-white/55 uppercase border-b border-white/5 pb-2">
            Historical Progress
          </h2>
        </header>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="p-4 border border-white/5">
            <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase block mb-2">Current Streak</span>
            <span className="text-3xl font-light">{data.streak} DAYS</span>
          </div>
          <div className="p-4 border border-white/5">
            <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase block mb-2">Consistency</span>
            <span className="text-3xl font-light">{data.consistency}%</span>
          </div>
          <div className="col-span-2 p-4 border border-white/5">
            <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase block mb-2">System Status</span>
            <span className="text-xl font-light italic">"{data.evolution?.[0]?.system_message || "Awaiting evaluation"}"</span>
          </div>
        </div>

        {/* GRAPH DATA */}
        <h3 className="text-xs font-mono tracking-[0.3em] text-white/45 uppercase mb-6">Metrics Evolution (Last 14 Days)</h3>
        <div className="mb-16 border border-white/5 p-6 h-64 flex items-end gap-2 overflow-x-auto custom-scrollbar">
          {data.graph_data.map((stat: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-[30px] gap-2">
              <div className="w-full flex justify-center gap-1 items-end h-[80%]">
                {/* XP Bar */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(stat.xp_gained / maxXP) * 100}%` }}
                  className="w-1/2 bg-white/40"
                  title={`XP: ${stat.xp_gained}`}
                />
                {/* Discipline Bar */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(stat.discipline / maxDiscipline) * 100}%` }}
                  className="w-1/2 bg-white"
                  title={`Discipline: ${stat.discipline}`}
                />
              </div>
              <span className="text-[8px] font-mono text-white/30 truncate w-full text-center">
                {stat.date.substring(5)}
              </span>
            </div>
          ))}
          {data.graph_data.length === 0 && <span className="text-sm font-mono text-white/40 m-auto">No historical data recorded yet. Execute tasks to generate metrics.</span>}
        </div>

        {/* EVOLUTION LOG */}
        <h3 className="text-xs font-mono tracking-[0.3em] text-white/45 uppercase mb-6">Evolution Log</h3>
        <div className="grid gap-6">
          {data.evolution.map((log: any, i: number) => (
            <div key={i} className="p-6 border border-white/5 group hover:border-white/10 transition-colors">
              <div className="flex justify-between items-end mb-4 font-mono">
                <span className="text-[10px] text-white/40">{log.created_at}</span>
                <span className="text-[12px] tracking-widest text-white">RANK {log.rank_snapshot}</span>
              </div>
              <p className="text-sm font-light leading-relaxed text-white/80 mb-4">{log.system_message}</p>
              
              <div className="grid gap-2 mt-4 pt-4 border-t border-white/5">
                {log.feedback && <p className="text-[10px] font-mono text-white/50"><span className="text-white/80 pr-2">ANALYSIS:</span> {log.feedback}</p>}
                {log.improvements && <p className="text-[10px] font-mono text-white/50"><span className="text-white/80 pr-2">OPTIMIZATION:</span> {log.improvements}</p>}
                {log.warnings && <p className="text-[10px] font-mono text-red-500/70"><span className="text-red-500 pr-2">WARNING:</span> {log.warnings}</p>}
              </div>
            </div>
          ))}
          {data.evolution.length === 0 && <span className="text-sm font-mono text-white/40">Initiate a daily evaluation execution to populate your timeline.</span>}
        </div>
      </main>
    </div>
  );
}
