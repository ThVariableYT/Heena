"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { memoryCards, type MemoryCard } from "@/lib/birthday-data";
import { sparkle } from "./SparkleCanvas";
import { playChime } from "@/lib/audio";

function MemoryCardItem({
  card,
  index,
  flipped,
  onFlip,
  order,
}: {
  card: MemoryCard;
  index: number;
  flipped: boolean;
  onFlip: (next: boolean, rect: DOMRect) => void;
  order: number;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const side = order % 2 === 0 ? -1 : 1;
  const offset = order * 0.08;

  const handleMove = (e: React.PointerEvent) => {
    if (!cardRef.current || flipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 18, ry: x * 22 });
  };

  const handleLeave = () => setTilt({ rx: 0, ry: 0 });

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onFlip(!flipped, rect);
  };

  return (
    <motion.div
      className="relative flex w-full justify-center"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: offset, ease: [0.16, 1, 0.3, 1] }}
      layout
    >
      <motion.div
        className="pointer-events-none absolute -inset-4 rounded-[2rem]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.12), transparent 70%)",
        }}
        animate={{ opacity: flipped ? 0.9 : 0.4 }}
      />

      <div
        className="group relative h-[380px] w-[280px] cursor-pointer perspective"
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onClick={handleClick}
        style={{ marginLeft: side > 0 ? "auto" : undefined, marginRight: side < 0 ? "auto" : undefined }}
      >
        <div className="glow-aura" />
        <motion.div
          className="preserve-3d relative h-full w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt.rx}deg) rotateY(${flipped ? 180 : 0 + tilt.ry}deg)`,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div
            className={`backface-hidden absolute inset-0 overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br ${card.accent} p-7 shadow-[0_20px_50px_-12px_rgba(244,63,94,0.15)]`}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-mono-elegant text-[0.6rem] uppercase tracking-[0.3em] text-stone-500">
                  {card.front.label}
                </span>
                <span className="text-2xl text-amber-600/70">{card.front.glyph}</span>
              </div>

              <div>
                <div className="mb-3 h-px w-12 bg-amber-500/40" />
                <h3 className="font-serif-elegant text-3xl font-bold leading-tight text-stone-800">
                  {card.front.title}
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-serif-elegant text-xs italic text-stone-500">
                  {flipped ? "tap to close" : "tap to reveal"}
                </span>
                <motion.div
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/30"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-amber-600/70">↻</span>
                </motion.div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
          </div>

          <div
            className="backface-hidden absolute inset-0 overflow-hidden rounded-[2rem] border border-amber-200/60 bg-gradient-to-br from-stone-900 via-stone-800 to-rose-950 p-7 text-amber-50 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4)]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="font-mono-elegant text-[0.6rem] uppercase tracking-[0.3em] text-amber-400/70">
                  {card.back.title}
                </span>
                <div className="my-3 h-px w-12 bg-amber-400/40" />
              </div>

              <p className="font-serif-elegant text-base italic leading-relaxed text-amber-100/90">
                &ldquo;{card.back.body}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <span className="font-serif-elegant text-xs text-rose-300/70">
                  {card.back.signature}
                </span>
                <span className="text-amber-400/60">✦</span>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function MemoryDeck() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const [order, setOrder] = useState<number[]>(memoryCards.map((_, i) => i));

  const handleFlip = useCallback(
    (cardId: number, next: boolean, rect: DOMRect, index: number) => {
      setFlippedSet((prev) => {
        const nextSet = new Set(prev);
        if (next) nextSet.add(cardId);
        else nextSet.delete(cardId);
        return nextSet;
      });
      if (next) {
        sparkle({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          count: 18,
          kind: "rainbow",
        });
        playChime(440 + index * 40, "sine", 0.8, 0.1);
      } else {
        playChime(330, "sine", 0.6, 0.08);
      }
    },
    [],
  );

  const revealedCount = flippedSet.size;
  const total = memoryCards.length;
  const allRevealed = revealedCount === total;

  const revealAll = () => {
    const all = new Set(memoryCards.map((c) => c.id));
    setFlippedSet(all);
    memoryCards.forEach((c, i) => {
      setTimeout(() => playChime(440 + i * 40, "sine", 0.8, 0.1), i * 80);
    });
    sparkle({ x: window.innerWidth / 2, y: window.innerHeight / 2, count: 50, kind: "rainbow" });
  };

  const closeAll = () => {
    setFlippedSet(new Set());
    playChime(220, "sine", 0.8, 0.08);
  };

  const shuffle = () => {
    const arr = [...order];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr);
    setFlippedSet(new Set());
    playChime(587.33, "triangle", 0.6, 0.1);
    sparkle({ x: window.innerWidth / 2, y: window.innerHeight / 2, count: 20, kind: "gold" });
  };

  return (
    <section ref={sectionRef} className="relative px-4 py-32">
      <motion.div className="mx-auto mb-12 max-w-3xl text-center" style={{ y: headingY }}>
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-amber-400/40" />
          <span className="font-mono-elegant text-[0.65rem] uppercase tracking-[0.4em] text-amber-700/70">
            the memory deck
          </span>
          <div className="h-px w-10 bg-amber-400/40" />
        </div>
        <h2 className="font-serif-elegant text-4xl font-bold text-stone-800 sm:text-5xl md:text-6xl">
          Six chapters,
          <br />
          <span className="bg-gradient-to-r from-rose-500 to-amber-600 bg-clip-text text-transparent">
            kept like cards
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-stone-600">
          Each card holds a moment. Tilt it, turn it over — let it tell you the part of the story
          it kept.
        </p>
      </motion.div>

      <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center gap-4">
        <div className="flex w-full items-center gap-4">
          <span className="font-mono-elegant text-xs uppercase tracking-[0.2em] text-stone-500">
            {revealedCount} / {total} revealed
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400"
              animate={{ width: `${(revealedCount / total) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <motion.button
            onClick={allRevealed ? closeAll : revealAll}
            className="group flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/70 px-5 py-2 text-xs font-semibold text-amber-700 backdrop-blur transition-colors hover:bg-amber-50"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={allRevealed ? "close" : "reveal"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2"
              >
                {allRevealed ? (
                  <>
                    <span>↻</span>
                    <span>Close all</span>
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    <span>Reveal all</span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={shuffle}
            className="group flex items-center gap-2 rounded-full border border-rose-300/60 bg-white/70 px-5 py-2 text-xs font-semibold text-rose-700 backdrop-blur transition-colors hover:bg-rose-50"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <motion.span
              animate={{ rotate: [0, 0, 180, 360] }}
              transition={{ duration: 0.6, times: [0, 0.4, 0.7, 1] }}
            >
              ⇆
            </motion.span>
            <span>Shuffle</span>
          </motion.button>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        {order.map((cardIndex, displayIndex) => {
          const card = memoryCards[cardIndex];
          return (
            <MemoryCardItem
              key={card.id}
              card={card}
              index={cardIndex}
              order={displayIndex}
              flipped={flippedSet.has(card.id)}
              onFlip={(next, rect) => handleFlip(card.id, next, rect, cardIndex)}
            />
          );
        })}
      </div>
    </section>
  );
}
