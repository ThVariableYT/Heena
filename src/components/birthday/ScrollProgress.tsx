"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, #fbbf24 0%, #f43f5e 40%, #a78bfa 70%, #fbbf24 100%)",
        boxShadow: "0 0 12px rgba(251,191,36,0.5), 0 0 24px rgba(244,63,94,0.3)",
      }}
      aria-hidden
    />
  );
}
