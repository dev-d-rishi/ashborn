"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Loader() {
  // Generate random particles that "drift" toward the center
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      distance: 150 + Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full h-screen bg-black overflow-hidden">
      
      {/* Container for the drifting mass */}
      <motion.div
        animate={{
          x: [0, 15, -10, 5, 0],
          y: [0, -10, 15, -5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center"
      >
        
        {/* INNER CORE: The Dark Orb */}
        <motion.div
          animate={{
            scale: [1, 1.03, 0.98, 1.05, 1],
            filter: [
              "drop-shadow(0 0 20px rgba(255,255,255,0.4))",
              "drop-shadow(0 0 45px rgba(255,255,255,0.6))",
              "drop-shadow(0 0 20px rgba(255,255,255,0.4))"
            ],
            x: [0, -1, 1, -0.5, 0], // Micro-shakes
          }}
          transition={{
            duration: 0.15,
            repeat: Infinity,
            repeatType: "mirror",
            repeatDelay: Math.random() * 5 // Occasional unpredictability
          }}
          className="relative z-30 w-24 h-24 rounded-full bg-black border border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.1)]"
        >
          {/* Core "Spike" Glow Overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse" />
        </motion.div>

        {/* ROTATING RINGS: Broken & Glitchy */}
        {[1, 2, 3].map((ring, i) => (
          <motion.div
            key={ring}
            animate={{ 
              rotate: i % 2 === 0 ? 360 : -360,
              scale: [1, 1.01, 0.99, 1],
            }}
            transition={{
              rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 2 }
            }}
            className="absolute border-dashed border-white/20 rounded-full"
            style={{
              width: `${120 + i * 50}px`,
              height: `${120 + i * 50}px`,
              borderWidth: '1px',
              borderStyle: "dashed"
              // borderDasharray: i === 1 ? "40 10 100 20" : "10 50 20 10",
            }}
          />
        ))}

        {/* INWARD PARTICLES */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: Math.cos(p.angle) * p.distance, 
              y: Math.sin(p.angle) * p.distance,
              opacity: 0 
            }}
            animate={{ 
              x: 0, 
              y: 0,
              opacity: [0, 0.5, 0] 
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeIn"
            }}
            className="absolute w-[1px] h-[1px] bg-white rounded-full z-10"
          />
        ))}

      </motion.div>

      {/* Background UI Decor */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <p className="text-[10px] font-mono tracking-[0.5em] text-white/20 uppercase">
          Containment Protocol: Active
        </p>
        <div className="w-48 h-[2px] bg-white/5 mt-4 overflow-hidden">
          <motion.div 
            animate={{ x: [-200, 200] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-white/20"
          />
        </div>
      </div>
    </div>
  );
}