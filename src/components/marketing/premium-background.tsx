"use client";

import { motion } from "framer-motion";

export function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030303]">
      {/* Background Noise & Grain */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Cybernetic Dotted Tech Grid */}
      <div 
        className="absolute inset-0 opacity-[0.22] mix-blend-screen"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)"
        }}
      />

      {/* Large Grid Line Accents */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "112px 112px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 90%)"
        }}
      />

      {/* Spotlight Radial Glow from the top-center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.04),transparent_80%)]" />

      {/* Subtle Bottom Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_80%_80%,rgba(255,255,255,0.03),transparent_85%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(255,255,255,0.02),transparent_80%)]" />

      {/* Animated Aurora Mesh Blobs (High depth, monochrome) */}
      <motion.div
        className="absolute -left-40 top-12 h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-[130px]"
        animate={{
          x: [0, 45, -20, 0],
          y: [0, 60, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 top-1/4 h-[450px] w-[450px] rounded-full bg-white/[0.03] blur-[120px]"
        animate={{
          x: [0, -50, 25, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-12 left-1/3 h-[380px] w-[380px] rounded-full bg-white/[0.03] blur-[100px]"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.05, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[10%] h-[350px] w-[350px] rounded-full bg-white/[0.02] blur-[110px]"
        animate={{
          x: [-20, 20, -20],
          y: [20, -20, 20],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ambient Floating Dust Particles (High density and depth) */}
      {Array.from({ length: 36 }).map((_, i) => {
        const size = (i % 3 === 0) ? "h-1.5 w-1.5" : "h-1 w-1";
        const brightness = (i % 2 === 0) ? "bg-white/40" : "bg-white/20";
        return (
          <motion.span
            key={i}
            className={`absolute rounded-full ${size} ${brightness}`}
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 19) % 100}%`,
            }}
            animate={{
              opacity: [0.08, 0.65, 0.08],
              y: [0, -18 - (i % 12), 0],
              x: [0, (i % 2 === 0 ? 8 : -8), 0],
            }}
            transition={{
              duration: 4 + (i % 6),
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
