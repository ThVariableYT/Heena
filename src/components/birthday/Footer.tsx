"use client";

import { motion } from "framer-motion";
import { footerSignature } from "@/lib/birthday-data";
import { sparkle } from "./SparkleCanvas";

export default function Footer() {
  const celebrate = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    sparkle({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      count: 30,
      kind: "rainbow",
    });
  };

  return (
    <footer className="relative mt-24 px-4 pb-10 pt-16">
      <div className="mx-auto max-w-3xl">
        <div className="editorial-line mb-12" />

        <motion.div
          className="flex flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.button
            onClick={celebrate}
            className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/50 bg-gradient-to-br from-amber-100/80 to-rose-100/80 shadow-lg backdrop-blur"
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            aria-label="One more sparkle"
          >
            <div
              className="absolute -inset-2 rounded-full opacity-60"
              style={{
                background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)",
              }}
            />
            <span className="relative text-3xl text-amber-600">✦</span>
          </motion.button>

          <p className="max-w-md font-serif-elegant text-lg italic leading-relaxed text-stone-600">
            &ldquo;{footerSignature}&rdquo;
          </p>

          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-amber-400/40" />
            <span className="font-mono-elegant text-[0.6rem] uppercase tracking-[0.4em] text-stone-400">
              fin
            </span>
            <div className="h-px w-8 bg-amber-400/40" />
          </div>

          <p className="font-mono-elegant text-[0.6rem] uppercase tracking-[0.3em] text-stone-400">
            composed with light, sound &amp; care
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
