export type MemoryCard = {
  id: number;
  front: {
    label: string;
    title: string;
    glyph: string;
  };
  back: {
    title: string;
    body: string;
    signature: string;
  };
  accent: string;
};

export const memoryCards: MemoryCard[] = [
  {
    id: 1,
    front: { label: "Chapter 01", title: "The First Hello", glyph: "✦" },
    back: {
      title: "Where it began",
      body: "I still remember the first time our paths crossed. Something in the air felt different — lighter, warmer, as if the universe had been quietly arranging the moment for a long time.",
      signature: "— a memory I keep replaying",
    },
    accent: "from-rose-200/60 to-amber-100/40",
  },
  {
    id: 2,
    front: { label: "Chapter 02", title: "Quiet Mornings", glyph: "❋" },
    back: {
      title: "Soft and unhurried",
      body: "Mornings with you taught me that slowness is a kind of luxury. The way light pooled on the floor, the sound of your laughter — ordinary moments that turned out to be the whole point.",
      signature: "— the smallest things, the loudest",
    },
    accent: "from-amber-200/60 to-rose-100/40",
  },
  {
    id: 3,
    front: { label: "Chapter 03", title: "The Long Talks", glyph: "✺" },
    back: {
      title: "Words that stayed",
      body: "We talked about everything and nothing, and somehow both mattered equally. You listened the way people rarely do — fully, without waiting for your turn to speak.",
      signature: "— heard, in the truest sense",
    },
    accent: "from-violet-200/60 to-amber-100/40",
  },
  {
    id: 4,
    front: { label: "Chapter 04", title: "Adventures Small", glyph: "❖" },
    back: {
      title: "Maps we drew ourselves",
      body: "We never needed a grand plan. A wrong turn, an unplanned stop, a meal we discovered by accident — every detour with you became a story worth keeping.",
      signature: "— lost, and found, at once",
    },
    accent: "from-emerald-200/60 to-amber-100/40",
  },
  {
    id: 5,
    front: { label: "Chapter 05", title: "Steady Through Storms", glyph: "✸" },
    back: {
      title: "The calm in the noise",
      body: "When the world got loud, you became the quiet center. Your presence is a kind of shelter — the kind you don't realize you needed until you step inside.",
      signature: "— anchored, always",
    },
    accent: "from-sky-200/60 to-rose-100/40",
  },
  {
    id: 6,
    front: { label: "Chapter 06", title: "Today, You", glyph: "✦" },
    back: {
      title: "A day that is yours",
      body: "Today the calendar pauses to honor the fact that you exist, that you keep choosing kindness, that you make the people around you feel more like themselves. That is no small thing.",
      signature: "— celebrated, completely",
    },
    accent: "from-rose-200/60 to-violet-100/40",
  },
];

export const jarThoughts: string[] = [
  "You listen with your whole heart and make others feel important.",
  "When things get stressful, your calm energy helps everyone feel safe.",
  "Your warm laugh always makes people feel happy and relaxed.",
  "You are a deeply loyal friend. I can trust you with anything.",
  "Thank you for being so kind and making the world a sweeter place.",
  "Your friendship is a safe place full of comfort and happiness.",
  "You notice the small things others miss, and that is a rare gift.",
  "Your curiosity makes even ordinary days feel like an adventure.",
  "You give without keeping score, and that generosity echoes.",
  "You make people feel braver just by standing beside them.",
];

export type Track = {
  name: string;
  duration: string;
  mood: string;
  lyrics: { time: number; text: string }[];
};

export type Track = {
  name: string;
  duration: string;
  mood: string;
  audioSrc: string; // Path to your .flac file
  lrcSrc: string;   // Path to your .lrc file
  lyrics: { time: number; text: string }[]; // Will hold the parsed lyrics
};

export const tracks: Track[] = [
  {
    name: "Your Thoughts",
    duration: "3:42",
    mood: "Warm · Ambient",
    audioSrc: "C:\\Users\\sarik\\Downloads\\Heena\\public\\Music\\Your Thoughts.flac",
    lrcSrc: "C:\\Users\\sarik\\Downloads\\Heena\\public\\Music\\Your Thoughts.lrc",
    lyrics: [], // We will parse the .lrc file into this array
  },
  {
    name: "Saajna",
    duration: "4:08",
    mood: "Tender · Reflective",
    audioSrc: "C:\\Users\\sarik\\Downloads\\Heena\\public\\Music\\Saajna.flac",
    lrcSrc: "C:\\Users\\sarik\\Downloads\\Heena\\public\\Music\\Saajna.lrc",
    lyrics: [],
  },
  {
    name: "Perfect",
    duration: "3:15",
    mood: "Bright · Hopeful",
    audioSrc: "C:\\Users\\sarik\\Downloads\\Heena\\public\\Music\\Perfect.m4a",
    lrcSrc: "C:\\Users\\sarik\\Downloads\\Heena\\public\\Music\\Perfect.lrc",
    lyrics: [],
  },
];
export type TimelineMoment = {
  id: number;
  season: string;
  title: string;
  detail: string;
  glyph: string;
  accent: "amber" | "rose" | "violet" | "emerald";
};

export const timelineMoments: TimelineMoment[] = [
  {
    id: 1,
    season: "the beginning",
    title: "A quiet first impression",
    detail: "Before I knew your name, I knew the feeling in the room when you walked in — something lighter, more awake.",
    glyph: "✦",
    accent: "amber",
  },
  {
    id: 2,
    season: "early days",
    title: "Learning your rhythms",
    detail: "The way you take your coffee, the songs you hum without noticing, the pause before you laugh. Small maps I started to memorize.",
    glyph: "❋",
    accent: "rose",
  },
  {
    id: 3,
    season: "the middle",
    title: "Carried through hard weeks",
    detail: "When the year turned heavy, you were the steady note underneath everything. I didn't say it enough then. I'm saying it now.",
    glyph: "✺",
    accent: "violet",
  },
  {
    id: 4,
    season: "lately",
    title: "Ordinary magic",
    detail: "A late drive, a shared silence, a meal that tasted like a small celebration. The days I'll remember longest were the unremarkable ones.",
    glyph: "❖",
    accent: "emerald",
  },
  {
    id: 5,
    season: "today",
    title: "You, again",
    detail: "Another orbit around the sun, and here you are — still kind, still curious, still becoming. The best chapter is the one still being written.",
    glyph: "✸",
    accent: "amber",
  },
];

export const heroSubtitle = "A birthday composed in light, sound, and memory — for someone who makes ordinary days feel like kept promises.";

export const introLines = [
  "> initializing celebration.protocol",
  "> loading memory.deck ............ ok",
  "> calibrating sparkle.engine ..... ok",
  "> warming harp.strings ........... ok",
  "> decrypting message.for(heena) .. ok",
  "> ready. tap the gift to begin.",
];

export const wishMessages = [
  "Make a wish, Heena. The whole room is listening.",
  "Whatever you wish for, may it find you this year.",
  "Blow gently — the candles are only the beginning.",
];

export const footerSignature = "Crafted slowly, with care. For Heena, on her day.";
