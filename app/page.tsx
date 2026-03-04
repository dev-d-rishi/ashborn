"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import StarfieldCanvas from "./components/StarFieldCanvas";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden cursor-none">
      {/* Background Particle Canvas */}
      <StarfieldCanvas />

      {/* Main Content */}
      <main className="relative z-20 flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <p className="text-[10px] font-mono tracking-[0.4em] text-white/70 uppercase mb-16 animate-pulse">
            // STATUS: SYSTEM_CORE_READY
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tighter text-white mb-8">
            ONYX <span className="font-bold">ELITE</span>
          </h1>

          <div className="w-12 h-[1px] bg-white/20 mx-auto mb-12" />

          <p className="text-xs md:text-sm font-light tracking-[0.15em] text-white/50 max-w-sm mx-auto mb-20 leading-relaxed">
            NEURAL ARCHITECTURE FOR THE
            <br />
            ADVANCED OPERATOR.
          </p>

          <motion.button
            onClick={() => router.push("/onboarding")}
            // whileHover={{ scale: 1.05, letterSpacing: "0.3em" }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-16 py-5 overflow-hidden border border-white/10 text-white text-[10px] font-mono tracking-[0.2em] uppercase transition-colors"
          >
            <span className="relative z-10">Initialize Sequence</span>
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </motion.button>
        </motion.div>
      </main>

      {/* Corner UI Accents for "Elite" feel */}
      <div className="absolute top-10 left-10 border-l border-t border-white/10 w-8 h-8" />
      <div className="absolute bottom-10 right-10 border-r border-b border-white/10 w-8 h-8" />
    </div>
  );
}
