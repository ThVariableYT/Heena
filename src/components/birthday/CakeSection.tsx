import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Adding premium font styles and keyframe animations for ambient flickering
const STYLE_INJECT = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  
  .font-serif-elegant {
    font-family: 'Playfair Display', Georgia, serif;
  }
  .font-sans-elegant {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }
  
  @keyframes flame-subtle {
    0%, 100% { transform: scaleY(1) scaleX(1) rotate(0deg); }
    50% { transform: scaleY(1.08) scaleX(0.95) rotate(1deg); }
  }
  .animate-flame {
    animation: flame-subtle 1.8s ease-in-out infinite alternate;
  }
`;

// Default wish messages matching original parameters
const wishMessages = [
  "May your year ahead be filled with sweet moments and golden surprises.",
  "Your wish is safe with the stars. Make it a wonderful year!",
];

const STORAGE_KEY = "heena:sealed-wish";

export default function App() {
  const [candles, setCandles] = useState([
    { id: 0, lit: true, color: "gold" },
    { id: 1, lit: true, color: "pink" },
    { id: 2, lit: true, color: "gold" },
  ]);
  const [showWish, setShowWish] = useState(false);
  const [wishInput, setWishInput] = useState("");
  const [sealedWish, setSealedWish] = useState(null);
  const [hasSealedBefore, setHasSealedBefore] = useState(false);

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSealedWish(saved);
        setHasSealedBefore(true);
      }
    } catch (e) {
      // no-op
    }
  }, []);

  // Pure Web Audio implementation for beautiful bell chimes
  const playSynthesizedChime = (freq, type = "sine", duration = 1.2, volume = 0.15) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Pitch slide upward for extra magic feel
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context block or unsupported: ", e);
    }
  };

  // Create beautiful magical explosions and smoke on blowout
  const triggerParticles = (x, y, count, type = "gold") => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = type === "smoke" ? Math.random() * 0.8 + 0.2 : Math.random() * 3 + 1.5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: type === "smoke" ? -Math.random() * 1.2 - 0.5 : Math.sin(angle) * speed - 0.5,
        alpha: 1,
        size: type === "smoke" ? Math.random() * 8 + 4 : Math.random() * 3.5 + 1.5,
        decay: type === "smoke" ? 0.015 : Math.random() * 0.02 + 0.015,
        color: type === "smoke" 
          ? "rgba(180, 180, 180, 0.45)" 
          : type === "rainbow"
            ? `hsl(${Math.random() * 360}, 90%, 70%)`
            : `rgba(${230 + Math.random() * 25}, ${170 + Math.random() * 60}, ${70 + Math.random() * 50}, 1)`, // Gold
        type,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrame;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const activeParticles = [];

      for (let p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.type === "smoke") {
          p.vy -= 0.01; // Smoke drifts upward
          p.size += 0.15; // Smoke expands
        } else {
          p.vy += 0.05; // Gravity pulls sparks slightly
        }

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          if (p.type === "gold" || p.type === "rainbow") {
            // Draw a shiny sparkle/star shape
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Smoke puff
            ctx.fillStyle = p.color;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          activeParticles.push(p);
        }
      }

      particlesRef.current = activeParticles;
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const blowOut = (id, clientX, clientY) => {
    setCandles((prev) => {
      const wasLit = prev.find((c) => c.id === id)?.lit;
      if (!wasLit) return prev;

      const next = prev.map((c) => (c.id === id ? { ...c, lit: false } : c));
      
      // Convert browser coordinates to local Canvas coordinates
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;

        // Trigger gorgeous particle puff
        triggerParticles(localX, localY, 15, "smoke");
        triggerParticles(localX, localY, 20, "gold");
      }

      // Play soft harmonic notes
      const pitch = id === 0 ? 523.25 : id === 1 ? 587.33 : 659.25; // C5, D5, E5 notes
      playSynthesizedChime(pitch, "triangle", 0.9, 0.12);

      // Check if all are blown out
      if (next.every((c) => !c.lit)) {
        setTimeout(() => {
          setShowWish(true);
          const wish = wishInput.trim() || wishMessages[0];
          setSealedWish(wish);
          try {
            localStorage.setItem(STORAGE_KEY, wish);
          } catch {
            // no-op
          }
          // Magical victory chimes and full explosion
          playSynthesizedChime(880, "sine", 1.5, 0.18);
          if (canvas) {
            triggerParticles(canvas.width / 2, canvas.height / 2, 60, "rainbow");
          }
        }, 500);
      }
      return next;
    });
  };

  const relight = () => {
    setCandles([
      { id: 0, lit: true, color: "gold" },
      { id: 1, lit: true, color: "pink" },
      { id: 2, lit: true, color: "gold" },
    ]);
    setShowWish(false);
    playSynthesizedChime(440, "sine", 0.8, 0.1);
  };

  const handleSectionMove = (e) => {
    const candlesEls = sectionRef.current?.querySelectorAll("[data-candle]");
    if (!candlesEls) return;
    
    candlesEls.forEach((el) => {
      const candle = el;
      if (candle.dataset.lit !== "true") return;
      
      const rect = candle.getBoundingClientRect();
      const padding = 35; // Sensitive detection bubble
      
      if (
        e.clientX >= rect.left - padding &&
        e.clientX <= rect.right + padding &&
        e.clientY >= rect.top - padding &&
        e.clientY <= rect.bottom + padding
      ) {
        const id = Number(candle.dataset.candle);
        blowOut(id, e.clientX, e.clientY);
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <style>{STYLE_INJECT}</style>
      
      {/* Container matching image_9000e6.png rounded layout */}
      <section
        ref={sectionRef}
        onPointerMove={handleSectionMove}
        className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFFBF2] via-[#FFF8FA] to-[#FFEBF1] px-6 py-20 text-center shadow-2xl border border-white/40"
      >
        {/* Particle Canvas Overlay for interactive feedback */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-20 w-full h-full"
        />

        {}
        {/* Subtle Decorative Star icons in background mimicking design theme */}
        <div className="absolute top-24 right-16 text-rose-300 opacity-60 text-xl pointer-events-none animate-pulse">✦</div>
        <div className="absolute top-48 left-12 text-amber-200 opacity-40 text-2xl pointer-events-none">✧</div>
        <div className="absolute bottom-16 right-32 text-pink-300 opacity-50 text-sm pointer-events-none">✦</div>

        <div className="mx-auto mb-10 max-w-2xl">
          <h1 className="font-serif-elegant text-4xl md:text-5xl font-normal text-stone-800 tracking-normal mb-3">
            Hazelnut Truffle Patisserie
          </h1>
          <p className="font-sans-elegant text-[0.7rem] md:text-xs font-bold uppercase tracking-[0.3em] text-[#FF4E79]">
            SWIPE OR TAP TO BLOW OUT THE FLAMES
          </p>
        </div>

        {}
        <div className="relative mx-auto flex max-w-lg flex-col items-center z-30 mb-8">
          <motion.div
            className="w-full max-w-sm rounded-2xl bg-white/50 backdrop-blur-md p-4 shadow-sm border border-rose-200/40 mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label className="mb-2 flex items-center justify-center gap-2">
              <span className="text-[#FF4E79] text-sm font-semibold">✎</span>
              <span className="font-sans-elegant text-[0.6rem] uppercase tracking-[0.25em] text-stone-500 font-bold">
                Whisper your wish (optional)
              </span>
            </label>
            <input
              type="text"
              value={wishInput}
              onChange={(e) => setWishInput(e.target.value)}
              maxLength={140}
              placeholder="Keep your wish safe here…"
              className="w-full rounded-xl border border-rose-100 bg-white/80 px-4 py-2 font-serif-elegant text-xs text-center italic text-stone-700 placeholder:text-stone-300 focus:border-[#FF4E79] focus:outline-none focus:ring-2 focus:ring-pink-300/20 transition-all shadow-inner"
            />
          </motion.div>
        </div>

        {}
        {/* Beautiful vector art matching design specifications in image_9000e6.png */}
        <div className="relative mx-auto flex max-w-md flex-col items-center justify-center select-none">
          
          {/* Custom Cake SVG illustration replicating the image */}
          <svg
            viewBox="0 0 400 280"
            className="w-full h-auto drop-shadow-[0_25px_35px_rgba(235,140,165,0.22)] overflow-visible"
          >
            <defs>
              {/* Flame Glow Filters */}
              <filter id="candle-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="ambient-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="15" result="blur" />
              </filter>
              
              {/* Smooth Candle Flame Gradient */}
              <linearGradient id="flame-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#FF3E6C" />
                <stop offset="35%" stopColor="#FF9F43" />
                <stop offset="75%" stopColor="#FFE066" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>

              {/* Rich Truffle Gradient matching image_9000e6.png dark brown cake */}
              <linearGradient id="truffle-body" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1E0E08" />
                <stop offset="25%" stopColor="#251209" />
                <stop offset="75%" stopColor="#2A160D" />
                <stop offset="100%" stopColor="#190B05" />
              </linearGradient>

              {/* Gold/Pink candle details */}
              <linearGradient id="gold-candle" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>
              <linearGradient id="pink-candle" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#FCE7F3" />
              </linearGradient>
            </defs>

            {/* Base Plate Subtle Shadow */}
            <ellipse cx="200" cy="246" rx="145" ry="9" fill="rgba(244, 63, 94, 0.08)" />
            <ellipse cx="200" cy="244" rx="135" ry="6" fill="rgba(30, 14, 8, 0.12)" />

            {/* BOTTOM TIER - Sleek chocolate slab */}
            {/* rounded corner path mimicking exact truffle base shape */}
            <path
              d="M 75 204 L 325 204 A 6 6 0 0 1 331 210 L 331 234 A 6 6 0 0 1 325 240 L 75 240 A 6 6 0 0 1 69 234 L 69 210 A 6 6 0 0 1 75 204 Z"
              fill="url(#truffle-body)"
            />

            {/* Bottom Tier Drips & Details (Cream, Pink, Gold dashes) */}
            <g opacity="0.95">
              {/* Dash 1: gold */}
              <rect x="86" y="209" width="4" height="15" rx="2" fill="#FFE066" opacity="0.9" />
              {/* Dash 2: pink */}
              <rect x="135" y="214" width="4" height="12" rx="2" fill="#F472B6" opacity="0.9" />
              {/* Dash 3: gold center */}
              <rect x="200" y="211" width="4" height="20" rx="2" fill="#FFE066" opacity="0.9" />
              {/* Dash 4: cream */}
              <rect x="265" y="216" width="4" height="10" rx="2" fill="#FFF" opacity="0.8" />
              {/* Dash 5: gold */}
              <rect x="306" y="210" width="4" height="14" rx="2" fill="#FFE066" opacity="0.9" />
            </g>

            {/* TOP TIER - Upper cake layer, narrower with elegant rounded top corners */}
            <path
              d="M 96 148 C 96 138 104 130 114 130 L 286 130 C 296 130 304 138 304 148 L 304 204 L 96 204 Z"
              fill="url(#truffle-body)"
            />

            {/* Tiny hazelnut peaks / decoration details in the center of the top tier */}
            <g opacity="0.9">
              {/* Peak 1 */}
              <path d="M 183 130 Q 187 125 191 130 Z" fill="#FFE066" />
              <circle cx="187" cy="130" r="1.5" fill="#FFE066" />
              {/* Peak 2 */}
              <path d="M 192 130 Q 196 123 200 130 Z" fill="#F472B6" />
              <circle cx="196" cy="130" r="2" fill="#FFB7D2" />
              {/* Peak 3 */}
              <path d="M 201 130 Q 205 125 209 130 Z" fill="#FFF" />
              <circle cx="205" cy="130" r="1.5" fill="#FFF" />
              {/* Peak 4 */}
              <path d="M 210 130 Q 214 126 218 130 Z" fill="#FFE066" />
              <circle cx="214" cy="130" r="1" fill="#FFE066" />
            </g>

            {/* CANDLES - Rendered natively in the SVG space to align exactly with image_9000e6.png */}
            
            {/* LEFT CANDLE: Gold */}
            <g>
              {/* Wick */}
              <line x1="135" y1="102" x2="135" y2="108" stroke="#5F524A" strokeWidth="2" strokeLinecap="round" />
              {/* Stick */}
              <rect x="131" y="108" width="8" height="30" rx="1.5" fill="url(#gold-candle)" />
              {/* Candle flame block inside SVG with framer motion flare */}
              <AnimatePresence>
                {candles[0].lit && (
                  <motion.g
                    key="left-flame"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="animate-flame"
                    style={{ transformOrigin: "135px 102px" }}
                  >
                    {/* Flame Ambient Glow */}
                    <circle cx="135" cy="94" r="14" fill="#FF5E7E" opacity="0.32" filter="url(#ambient-glow)" />
                    {/* Outer flame */}
                    <path d="M 135 102 C 128 94 128 82 135 74 C 142 82 142 94 135 102 Z" fill="url(#flame-grad)" filter="url(#candle-glow)" />
                    {/* Inner core brightness */}
                    <ellipse cx="135" cy="91" rx="2" ry="4" fill="#FFFFEE" opacity="0.9" />
                  </motion.g>
                )}
              </AnimatePresence>
            </g>

            {/* MIDDLE CANDLE: Pink & Slightly higher */}
            <g>
              {/* Wick */}
              <line x1="200" y1="96" x2="200" y2="102" stroke="#5F524A" strokeWidth="2" strokeLinecap="round" />
              {/* Stick */}
              <rect x="196" y="102" width="8" height="34" rx="1.5" fill="url(#pink-candle)" />
              {/* Candle flame block inside SVG */}
              <AnimatePresence>
                {candles[1].lit && (
                  <motion.g
                    key="middle-flame"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="animate-flame"
                    style={{ transformOrigin: "200px 96px" }}
                  >
                    {/* Flame Ambient Glow */}
                    <circle cx="200" cy="88" r="14" fill="#FF5E7E" opacity="0.32" filter="url(#ambient-glow)" />
                    {/* Outer flame */}
                    <path d="M 200 96 C 193 88 193 76 200 68 C 207 76 207 88 200 96 Z" fill="url(#flame-grad)" filter="url(#candle-glow)" />
                    {/* Inner core brightness */}
                    <ellipse cx="200" cy="85" rx="2.2" ry="4.5" fill="#FFFFEE" opacity="0.9" />
                  </motion.g>
                )}
              </AnimatePresence>
            </g>

            {/* RIGHT CANDLE: Gold */}
            <g>
              {/* Wick */}
              <line x1="265" y1="102" x2="265" y2="108" stroke="#5F524A" strokeWidth="2" strokeLinecap="round" />
              {/* Stick */}
              <rect x="261" y="108" width="8" height="30" rx="1.5" fill="url(#gold-candle)" />
              {/* Candle flame block inside SVG */}
              <AnimatePresence>
                {candles[2].lit && (
                  <motion.g
                    key="right-flame"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="animate-flame"
                    style={{ transformOrigin: "265px 102px" }}
                  >
                    {/* Flame Ambient Glow */}
                    <circle cx="265" cy="94" r="14" fill="#FF5E7E" opacity="0.32" filter="url(#ambient-glow)" />
                    {/* Outer flame */}
                    <path d="M 265 102 C 258 94 258 82 265 74 C 272 82 272 94 265 102 Z" fill="url(#flame-grad)" filter="url(#candle-glow)" />
                    {/* Inner core brightness */}
                    <ellipse cx="265" cy="91" rx="2" ry="4" fill="#FFFFEE" opacity="0.9" />
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          </svg>

          {}
          {/* Positional overlay hotspots matching exact SVG proportions for tap/hover triggers */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {/* Left Flame Trigger */}
            <div
              data-candle="0"
              data-lit={candles[0].lit}
              onClick={(e) => candles[0].lit && blowOut(0, e.clientX, e.clientY)}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: "33.7%",
                top: "23%",
                width: "48px",
                height: "64px",
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* Middle Flame Trigger */}
            <div
              data-candle="1"
              data-lit={candles[1].lit}
              onClick={(e) => candles[1].lit && blowOut(1, e.clientX, e.clientY)}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: "50%",
                top: "20.5%",
                width: "48px",
                height: "64px",
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* Right Flame Trigger */}
            <div
              data-candle="2"
              data-lit={candles[2].lit}
              onClick={(e) => candles[2].lit && blowOut(2, e.clientX, e.clientY)}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: "66.3%",
                top: "23%",
                width: "48px",
                height: "64px",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </div>

        {}
        {/* Animated premium container for displaying sealed wish states */}
        <AnimatePresence>
          {showWish && sealedWish && (
            <motion.div
              className="relative mx-auto mt-12 max-w-lg rounded-[2rem] bg-white/60 backdrop-blur-lg p-8 text-center border border-rose-200/40 shadow-xl z-30"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="mb-4 text-2xl text-[#FF4E79]"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                ✦
              </motion.div>
              <span className="font-sans-elegant text-[0.6rem] uppercase tracking-[0.3em] text-[#FF4E79] font-bold">
                {hasSealedBefore ? "your sealed wish" : "wish, sealed"}
              </span>
              <p className="mt-3 font-serif-elegant text-2xl italic leading-relaxed text-stone-800 px-2">
                &ldquo;{sealedWish}&rdquo;
              </p>
              <p className="mt-4 font-sans-elegant text-xs text-stone-500 max-w-sm mx-auto">
                {wishMessages[1]}
              </p>
              <div className="mt-4 font-sans-elegant text-[0.55rem] uppercase tracking-[0.2em] text-stone-400 font-semibold">
                kept in this browser · relight to update
              </div>
              
              <motion.button
                onClick={relight}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/50 px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-wider text-[#FF4E79] transition-colors hover:bg-rose-100"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>↻</span>
                <span>Relight the candles</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}