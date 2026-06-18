"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { tracks, type Track } from "@/lib/birthday-data";
import { sparkle } from "./SparkleCanvas";
import { playChime, startProceduralMelody } from "@/lib/audio";

// 📝 Flexible parser matching standard formats safely
function parseLRC(lrcText: string): { time: number; text: string }[] {
  if (!lrcText) return [];
  const lines = lrcText.split("\n");
  const result: { time: number; text: string }[] = [];
  const timeRegex = /\[(\d+):(\d+)(?:[\.:](\d+))?\]/;

  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const totalSeconds = minutes * 60 + seconds;
      const text = line.replace(timeRegex, "").trim();
      
      if (text) {
        result.push({ time: totalSeconds, text });
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

export default function VinylPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const proceduralRef = useRef<any>(null); // ✅ Fixed: Prevents Next.js Node vs Browser timer type conflicts

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (proceduralRef.current) clearInterval(proceduralRef.current);
    };
  }, []);

  // ✅ Fixed: Made 'e' optional so auto-play clicks don't need fake event objects
  const selectTrack = async (track: Track, e?: React.MouseEvent) => {
    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      sparkle({ x: rect.left + rect.width / 2, y: rect.top, count: 12, kind: "gold" });
    } else {
      const cx = window.innerWidth / 2;
      sparkle({ x: cx, y: window.innerHeight / 2, count: 12, kind: "gold" });
    }

    if (currentTrack?.name === track.name && playing) {
      stopPlayback();
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    if (proceduralRef.current) {
      clearInterval(proceduralRef.current);
      proceduralRef.current = null;
    }

    let parsedLyrics: { time: number; text: string }[] = [];
    try {
      const response = await fetch(track.lrcSrc);
      if (response.ok) {
        const lrcText = await response.text();
        parsedLyrics = parseLRC(lrcText);
      }
    } catch (err) {
      console.error("Could not load lyrics:", err);
    }

    setCurrentTrack({
      ...track,
      lyrics: parsedLyrics
    });
    setPlaying(true);
    setElapsed(0);
    setActiveLyricIndex(-1);

    const audio = new Audio(track.audioSrc);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      const currentTime = audio.currentTime;
      setElapsed(currentTime);
      
      let idx = -1;
      for (let i = 0; i < parsedLyrics.length; i++) {
        if (currentTime >= parsedLyrics[i].time) idx = i;
        else break;
      }
      setActiveLyricIndex(idx);
    };

    audio.onloadedmetadata = () => {
      setTrackDuration(audio.duration || 0);
    };

    audio.onended = () => {
      stopPlayback();
    };

    const chords = [261.63, 329.63, 392.0, 493.88];
    proceduralRef.current = startProceduralMelody(() => {
      const cx = window.innerWidth / 2;
      sparkle({ x: cx + (Math.random() * 80 - 40), y: window.innerHeight / 2, count: 1, kind: "rainbow" });
    });
    playChime(chords[0], "sine", 1.5, 0.1);

    audio.play().catch((err) => console.log("Playback interaction requirement:", err));
  };

  const stopPlayback = () => {
    setPlaying(false);
    setCurrentTrack(null);
    setElapsed(0);
    setActiveLyricIndex(-1);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (proceduralRef.current) {
      clearInterval(proceduralRef.current);
      proceduralRef.current = null;
    }
    playChime(220, "sine", 0.8, 0.08);
  };

  const handleVinylClick = () => {
    if (playing) {
      stopPlayback();
    } else if (tracks[0]) {
      selectTrack(tracks[0]); // ✅ Fixed: Clean, safe call without simulated properties
    }
  };

  // ✅ Fixed: Prevent division-by-zero NaN layout calculation errors
  const progressPercent = trackDuration > 0 ? Math.min((elapsed / trackDuration) * 100, 100) : 0;

  return (
    <section className="relative px-4 py-32">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-amber-400/40" />
          <span className="font-mono-elegant text-[0.65rem] uppercase tracking-[0.4em] text-amber-700/70">
            the record player
          </span>
          <div className="h-px w-10 bg-amber-400/40" />
        </div>
        <h2 className="font-serif-elegant text-4xl font-bold text-stone-800 sm:text-5xl">
          A few songs,
          <span className="bg-gradient-to-r from-rose-500 to-amber-600 bg-clip-text text-transparent">
            {" "}
            pressed in your honour
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base text-stone-600">
          Three tracks, three moods. Spin one and let the words find you.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_1.2fr]">
        <motion.div
          className="glass-premium relative flex flex-col items-center rounded-[2rem] p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className={`vinyl-glow absolute -inset-3 rounded-full ${playing ? "playing" : ""}`} aria-hidden />
            <motion.button
              onClick={handleVinylClick}
              className="relative h-56 w-56 cursor-pointer rounded-full"
              aria-label={playing ? "Pause" : "Play"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className={`vinyl-metallic absolute inset-0 rounded-full ${playing ? "" : "paused-record"}`}
                animate={playing ? { rotate: 360 } : { rotate: 0 }}
                transition={playing ? { duration: 11, repeat: Infinity, ease: "linear" } : { duration: 0 }}
              />
              <div className="absolute inset-0 rounded-full ring-2 ring-stone-900/40" />
              <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-rose-400 to-amber-500 shadow-inner">
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-100 to-rose-200 opacity-90">
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <span className="font-serif-elegant text-[0.6rem] uppercase tracking-[0.3em] text-rose-800/70">side a</span>
                    <span className="mt-1 font-serif-elegant text-sm font-bold text-rose-900">
                      {currentTrack ? currentTrack.name : "for heena"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900" />
            </motion.button>

            <motion.div
              className="absolute -right-2 -top-6 h-20 w-2 origin-bottom rounded-full bg-gradient-to-b from-stone-300 to-stone-500 shadow-lg"
              animate={{ rotate: playing ? 5 : -15 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{ transformOrigin: "bottom right" }}
            >
              <div className="absolute -right-1 top-1 h-5 w-5 rounded-full bg-gradient-to-br from-stone-200 to-stone-400 shadow" />
            </motion.div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-6 items-end gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-amber-500 ${playing ? "music-bar-active" : ""}`}
                  style={{ height: "4px", animationDelay: playing ? `${i * 0.15}s` : "0s" }}
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentTrack?.name || "idle"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="font-serif-elegant text-sm italic text-stone-600"
              >
                {currentTrack ? currentTrack.name : "tap to play a song"}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="space-y-2">
            {tracks.map((track, i) => {
              const isActive = currentTrack?.name === track.name && playing;
              const indexStr = String(i + 1).padStart(2, "0");
              return (
                <motion.button
                  key={track.name}
                  onClick={(e) => selectTrack(track, e)}
                  className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all interactive-scale ${
                    isActive ? "border-amber-300 bg-amber-50/80 shadow-md" : "border-white/70 bg-white/60 hover:border-amber-200 hover:bg-white/90 hover:shadow-md"
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-serif-elegant text-lg text-stone-400 group-hover:text-amber-700">{indexStr}</span>
                    <div>
                      <div className="font-bold text-stone-800">{track.name}</div>
                      <div className="font-mono-elegant text-[0.65rem] uppercase tracking-[0.2em] text-stone-400">
                        {track.mood} · {track.duration}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${isActive ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600"}`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {isActive ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <rect x="2" y="1" width="3" height="10" rx="1" />
                        <rect x="7" y="1" width="3" height="10" rx="1" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M3 1 L10 6 L3 11 Z" />
                      </svg>
                    )}
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {currentTrack && playing && (
              <motion.div
                className="glass-card overflow-hidden rounded-2xl"
                initial={{ maxHeight: 0, opacity: 0, marginTop: 0 }}
                animate={{ maxHeight: 280, opacity: 1, marginTop: 16 }}
                exit={{ maxHeight: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="no-scrollbar h-full overflow-y-auto p-5" style={{ maxHeight: 280 }}>
                  {(currentTrack.lyrics || []).map((line, i) => (
                    <div key={i} className={`lyric-line font-serif-elegant text-base ${i === activeLyricIndex ? "active" : ""}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {currentTrack && playing && trackDuration > 0 && (
            <div className="flex items-center gap-3 px-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <span className="font-mono-elegant text-[0.65rem] text-stone-500">
                {Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, "0")}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}