"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export default function InteractiveCard({
  children,
}: {
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth glow movement
  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  // Tilt Effect
  const rotateX = useTransform(mouseY, [-200, 200], [8, -8]);
  const rotateY = useTransform(mouseX, [-200, 200], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="
        group relative overflow-hidden rounded-[2rem]
        border border-white/10
        bg-white/5 backdrop-blur-xl
        transition-all duration-500
        hover:-translate-y-3
        hover:border-blue-500/40
        hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]
      "
    >
      {/* Gradient Border Glow */}
      <div className="absolute inset-0 rounded-[2rem] p-[1px] bg-gradient-to-br from-blue-500/40 via-cyan-400/20 to-purple-500/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="h-full w-full rounded-[2rem] bg-[#060816]" />
      </div>

      {/* Mouse Follow Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)",
          x: smoothX,
          y: smoothY,
        }}
      />

      {/* Content */}
      <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
        {children}
      </div>
    </motion.div>
  );
}