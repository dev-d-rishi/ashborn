"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import StarfieldCanvas from "../components/StarFieldCanvas";

interface EvaluationProps {
  targetGoal?: string;
  disciplineIndex?: number;
  alignment?: number;
}

export default function EvaluationResult({
  targetGoal = "TRANSCENDENCE",
  disciplineIndex = 14.5,
  alignment = 0.8,
}: EvaluationProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8 py-12 overflow-hidden font-sans">
      {/* Background UI Accents */}
      <StarfieldCanvas />

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-full max-w-2xl z-10"
      >
        {/* Header Section */}
        <header className="mb-12 md:mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-mono tracking-[0.5em] text-white/60 uppercase mb-4"
          >
            // INITIAL EVALUATION COMPLETE
          </motion.p>
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tighter text-white">
            CURRENT FORM{" "}
            <span className="font-bold underline underline-offset-8 decoration-white/10">
              ANALYZED
            </span>
          </h1>
        </header>

        {/* System Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-y-10 gap-x-12 mb-14 md:mb-16 border-y border-white/5 py-10">
          <section className="space-y-1">
            <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
              Target Goal
            </p>
            <p className="text-xl font-light tracking-wide">
              {targetGoal.toUpperCase()}
            </p>
          </section>

          <section className="space-y-1">
            <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
              Discipline Index
            </p>
            <p className="text-xl font-light tracking-wide">
              {disciplineIndex}%
            </p>
          </section>

          <section className="md:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                Alignment with Target
              </p>
              <p className="text-sm font-mono text-white/60">{alignment}%</p>
            </div>

            {/* Alignment Bar */}
            <div className="relative w-full h-[2px] bg-white/5 gap-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${alignment}%` }}
                transition={{ duration: 3, ease: "circOut" }}
                className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              />
              <div className="flex justify-between text-[8px] font-mono text-white/50 uppercase mt-4 tracking-tighter">
                <span className="mt-4">Current You</span>
                <span className="mt-4">Target You</span>
              </div>
            </div>
          </section>
        </div>

        {/* Rank Section */}
        <div className="text-center mb-14 md:mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <p className="text-[11px] font-mono tracking-[0.4em] text-white/70 mb-2">
              RANK ASSIGNED
            </p>
            <h2 className="text-9xl font-black tracking-tighter text-white opacity-90">
              E
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-xs md:text-sm font-light leading-relaxed text-white/70 max-w-sm mx-auto mt-6 italic"
          >
            “Declared ambition exceeds current execution. <br />
            Biological and psychological correction phase initiated.”
          </motion.p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(255,255,255,1)",
              color: "#000",
            }}
            whileTap={{ scale: 0.98 }}
            className="px-20 py-5 border border-white/20 text-[11px] font-mono tracking-[0.5em] uppercase transition-all duration-500"
            onClick={() => router.push("/dashboard")}
          >
            Enter System
          </motion.button>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-8">
        <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
          System Ver: 0.9.4 // Elite Tier Access
        </p>
      </div>
    </div>
  );
}
