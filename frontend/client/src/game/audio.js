const SETTINGS_KEY = "bubble_audio_v1";

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { sound: true, music: true, ...JSON.parse(raw) };
  } catch {
    // blocked or corrupted storage: use defaults
  }
  return { sound: true, music: true };
}

let settings = loadSettings();
let ctx = null; // AudioContext is created lazily (browsers need a user click first)

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export const getAudioSettings = () => ({ ...settings });

/* ---------------- Sound effects ---------------- */

export function setSoundEnabled(on) {
  settings.sound = on;
  saveSettings();
}

// One short beep that can slide from `freq` to `freqEnd`
function tone({
  freq,
  freqEnd,
  duration = 0.1,
  type = "sine",
  volume = 0.15,
  delay = 0,
}) {
  if (!settings.sound) return; // sound OFF = nothing plays
  const c = getCtx();
  if (!c) return;

  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);

  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sfx = {
  click: () =>
    tone({ freq: 600, freqEnd: 400, duration: 0.06, type: "square", volume: 0.08 }),

  shoot: () => tone({ freq: 300, freqEnd: 800, duration: 0.12 }),

  stick: () =>
    tone({ freq: 220, freqEnd: 120, duration: 0.08, type: "triangle", volume: 0.2 }),

  // more bubbles popped = higher pitch
  pop: (count = 3) => {
    const base = 500 + Math.min(count, 10) * 40;
    tone({ freq: base, freqEnd: base * 1.8, duration: 0.1, type: "triangle" });
    if (count >= 5) {
      tone({ freq: base * 1.5, freqEnd: base * 2.4, duration: 0.12, delay: 0.06 });
    }
  },

  fall: () =>
    tone({ freq: 700, freqEnd: 150, duration: 0.35, type: "sine", volume: 0.12 }),

  win: () =>
    [523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, duration: 0.18, type: "triangle", delay: i * 0.12 })
    ),

  lose: () =>
    [400, 330, 262].forEach((f, i) =>
      tone({ freq: f, duration: 0.25, type: "sawtooth", volume: 0.1, delay: i * 0.18 })
    ),
};

/* ---------------- Background music ---------------- */
// A small looping tune made of 4 chords (C, G, Am, F), played note by note.

const STEP = 0.28; // seconds per note
const MELODY = [
  523, 659, 784, 659, // C
  494, 587, 784, 587, // G
  440, 523, 659, 523, // Am
  440, 523, 698, 523, // F
];
const BASS = [131, 98, 110, 87]; // one bass note per chord

let musicTimer = null;
let musicGain = null;
let musicStep = 0;
let nextNoteTime = 0;

function musicNote(freq, time, duration, type, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(musicGain);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

function scheduleMusic() {
  if (!ctx || !musicGain) return;
  if (nextNoteTime < ctx.currentTime) nextNoteTime = ctx.currentTime;

  // schedule a little ahead of time so playback stays smooth
  while (nextNoteTime < ctx.currentTime + 0.4) {
    const i = musicStep % MELODY.length;
    musicNote(MELODY[i], nextNoteTime, STEP * 0.9, "triangle", 0.5);
    if (i % 4 === 0) {
      musicNote(BASS[i / 4], nextNoteTime, STEP * 3.6, "sine", 0.7);
    }
    nextNoteTime += STEP;
    musicStep++;
  }
}

export function startMusic() {
  const c = getCtx(); // also resumes the context after a user click
  if (!c || !settings.music || musicTimer) return;

  musicGain = c.createGain();
  musicGain.gain.value = 0.1; // music stays quieter than effects
  musicGain.connect(c.destination);

  musicStep = 0;
  nextNoteTime = c.currentTime + 0.05;
  scheduleMusic();
  musicTimer = setInterval(scheduleMusic, 100);
}

export function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  if (musicGain) {
    // mute and disconnect right away so already-scheduled notes go silent too
    musicGain.gain.value = 0;
    musicGain.disconnect();
    musicGain = null;
  }
}

// Music ON/OFF is completely separate from Sound ON/OFF
export function setMusicEnabled(on) {
  settings.music = on;
  saveSettings();
  if (on) startMusic();
  else stopMusic();
}