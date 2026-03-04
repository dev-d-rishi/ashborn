"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, label: "Strength training", xp: "+12", done: false },
    { id: 2, label: "Calorie surplus", xp: "+08", done: true },
    { id: 3, label: "Protein target", xp: "+05", done: true },
    { id: 4, label: "Combat practice", xp: "+20", done: false },
    { id: 5, label: "Sleep target", xp: "+10", done: false },
  ]);

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  const router = useRouter();

  return (
    <div className="min-h-screen text-white font-sans selection:bg-white/20 flex flex-col overflow-hidden">
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-8 py-12 gap-16 overflow-y-auto custom-scrollbar">
        {/* PROTOCOL SECTION */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-2">
            <h2 className="text-xs font-mono tracking-[0.5em] text-white/55 uppercase">
              Today's Protocol
            </h2>
            <span className="text-[9px] text-white/35 font-mono italic">
              EXECUTION REQUIRED
            </span>
          </div>

          <div className="grid gap-3">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.02)" }}
                className="group flex items-center justify-between p-4 border border-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`w-2 h-2 rounded-full border ${task.done ? "bg-white border-white" : "border-white/20"}`}
                  />
                  <span
                    className={`text-sm tracking-wide font-light ${task.done ? "text-white/55 line-through" : "text-white/80"}`}
                  >
                    {task.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/35 group-hover:text-white/50 transition-colors">
                  XP {task.xp}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ALIGNMENT VISUALIZER */}
        <section className="py-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-[9px] font-mono text-white/45 tracking-widest uppercase">
              Current You
            </span>
            <span className="text-xs font-mono text-white tracking-[0.3em]">
              23% ALIGNED
            </span>
            <span className="text-[9px] font-mono text-white/45 tracking-widest uppercase">
              Target You
            </span>
          </div>
          <div className="relative h-0.5 w-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "23%" }}
              transition={{ duration: 2, ease: "circOut" }}
              className="absolute inset-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            />
          </div>
        </section>

        {/* BOTTOM GRID: OBJECTIVES & SYSTEM LOGS */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* PRIMARY OBJECTIVE */}
          <section>
            <h3 className="text-[10px] font-mono tracking-[0.4em] text-white/45 uppercase mb-6">
              Primary Objective
            </h3>
            <div className="p-6 border border-white/5 bg-linear-to-br from-white/2 to-transparent">
              <p className="text-sm font-light mb-4 tracking-wide text-white/80">
                Gain +10kg combat-ready muscle
              </p>
              <div className="flex items-end justify-between text-[10px] font-mono mb-2">
                <span className="text-white/55">Progress</span>
                <span className="text-white">1.2 / 10kg</span>
              </div>
              <div className="h-1 w-full bg-white/5">
                <div className="h-full bg-white/20 w-[12%]" />
              </div>
            </div>
          </section>

          {/* SYSTEM MESSAGES */}
          <section>
            <h3 className="text-[10px] font-mono tracking-[0.4em] text-white/45 uppercase mb-6">
              System Analysis
            </h3>
            <div className="space-y-4 font-mono text-[10px] tracking-wider text-white/55">
              <motion.p
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="flex gap-3"
              >
                <span className="text-white/35">[{currentTime}]</span>
                DISCIPLINE IMPROVING. MAINTAIN MOMENTUM.
              </motion.p>
              <p className="flex gap-3 text-white/35">
                <span>[04:12:01]</span>
                AVERAGE BEHAVIOR DETECTED YESTERDAY.
              </p>
              <p className="flex gap-3">
                <span className="text-white/35">[00:00:00]</span>
                CONSISTENCY DETERMINES RANK.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Subtle UI Scanning Line */}
      <motion.div
        animate={{ y: ["0vh", "100vh"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="fixed inset-0 pointer-events-none w-full h-px bg-white/3 z-100"
      />
    </div>
  );
}
