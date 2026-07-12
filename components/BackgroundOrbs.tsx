"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface BackgroundOrbsProps {
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  personality?: "roses" | "stars" | "golden" | "glitch" | "chaos";
}

export function BackgroundOrbs({ colors, personality = "roses" }: BackgroundOrbsProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Ultra-silky GPU springs for 240fps responsiveness
  const springConfig = { stiffness: 60, damping: 25, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize between -30px and 30px without triggering React re-renders
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 50);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 50);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const primaryColor = colors?.primary || "#FF2A85";
  const secondaryColor = colors?.secondary || "#FF73B3";
  const accentColor = colors?.accent || "#FFD166";
  const bgColor = colors?.background || "#F6F7FA";

  return (
    <div
      suppressHydrationWarning
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-500 gpu-layer"
      style={{ backgroundColor: bgColor }}
    >
      {/* Studio Ghibli warm ambient sunray / light-mode diffusion */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-60" />

      {/* Orb 1: Primary Warm Glow */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          background: `radial-gradient(circle, ${primaryColor}38 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.12, 0.96, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full blur-[90px] opacity-75 gpu-layer"
      />

      {/* Orb 2: Secondary Soft Rose/Teal Diffusion */}
      <motion.div
        style={{
          x: useSpring(useMotionValue(0), { ...springConfig, stiffness: 45 }),
          y: useSpring(useMotionValue(0), { ...springConfig, stiffness: 45 }),
          background: `radial-gradient(circle, ${secondaryColor}30 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 0.92, 1.15, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 -right-32 w-[680px] h-[680px] rounded-full blur-[100px] opacity-70 gpu-layer"
      />

      {/* Orb 3: Accent Warm Ghibli Gold/Sunlight */}
      <motion.div
        style={{
          background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
        }}
        animate={{
          scale: [0.95, 1.1, 0.95],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full blur-[110px] opacity-65 gpu-layer"
      />

      {/* Personality Specific Floating Particles (240fps GPU Accelerated) */}
      {personality === "stars" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full shadow-sm"
              style={{
                top: `${(i * 19) % 92}%`,
                left: `${(i * 27) % 92}%`,
                backgroundColor: i % 2 === 0 ? primaryColor : accentColor,
              }}
              animate={{
                opacity: [0.15, 0.85, 0.15],
                scale: [0.7, 1.4, 0.7],
              }}
              transition={{
                duration: 2.5 + (i % 3),
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {personality === "roses" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl select-none font-serif opacity-30"
              style={{
                top: `${(i * 29) % 88}%`,
                left: `${(i * 21) % 88}%`,
                color: primaryColor,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 18, -18, 0],
                opacity: [0.15, 0.45, 0.15],
              }}
              transition={{
                duration: 5 + (i % 4),
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut",
              }}
            >
              ♥
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
