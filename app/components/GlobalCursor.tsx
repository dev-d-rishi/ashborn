'use client'
import { useMotionValue, motion } from "framer-motion";
import { useEffect } from "react";

export function GlobalCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Glow */}
      <motion.div
        className="fixed top-0 left-0 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-[999]"
        style={{
          x: mouseX,
          y: mouseY,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full mix-blend-difference pointer-events-none z-[1000]"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      />
    </>
  );
}
