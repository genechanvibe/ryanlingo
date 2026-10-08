// Web Audio synthesizer sound effects (no audio assets needed).
let ctx = null;

function getCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// notes: [{ freq, start (s offset), duration, peak?, type? }]
function playNotes(notes, { type = 'sine', peak = 0.25, attack = 0.02 } = {}) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  notes.forEach((n) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    const t = now + n.start;
    osc.type = n.type ?? type;
    osc.frequency.setValueAtTime(n.freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(n.peak ?? peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, t + n.duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + n.duration);
  });
}

// single oscillator with a frequency sweep
function playSweep({ from, to, duration, type = 'sine', peak = 0.2, linearFade = false }) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + duration);
  gain.gain.setValueAtTime(peak, now);
  if (linearFade) gain.gain.linearRampToValueAtTime(0.001, now + duration);
  else gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + duration);
}

export const sfx = {
  correct: () =>
    playNotes([
      { freq: 523.25, start: 0, duration: 0.12 },
      { freq: 659.25, start: 0.1, duration: 0.12 },
      { freq: 783.99, start: 0.2, duration: 0.12 },
      { freq: 1046.5, start: 0.3, duration: 0.35 },
    ]),

  wrong: () =>
    playNotes(
      [
        { freq: 180, start: 0, duration: 0.15 },
        { freq: 140, start: 0.12, duration: 0.25 },
      ],
      { type: 'sawtooth', peak: 0.2, attack: 0.001 },
    ),

  brilliant: () =>
    playNotes(
      [
        { freq: 523.25, start: 0, duration: 0.12 },
        { freq: 659.25, start: 0.08, duration: 0.12 },
        { freq: 783.99, start: 0.16, duration: 0.12 },
        { freq: 1046.5, start: 0.24, duration: 0.2 },
        { freq: 1318.51, start: 0.36, duration: 0.15 },
        { freq: 1567.98, start: 0.48, duration: 0.5 },
      ],
      { type: 'triangle', peak: 0.3 },
    ),

  fanfare: () =>
    playNotes(
      [
        { freq: 523.25, start: 0, duration: 0.12 },
        { freq: 659.25, start: 0.08, duration: 0.12 },
        { freq: 783.99, start: 0.16, duration: 0.12 },
        { freq: 1046.5, start: 0.24, duration: 0.4 },
      ],
      { type: 'triangle', peak: 0.3 },
    ),

  pop: () => playSweep({ from: 400, to: 800, duration: 0.08 }),

  powerup: () => playSweep({ from: 300, to: 900, duration: 0.35, peak: 0.15, linearFade: true }),

  rumble: (intensity = 1) =>
    playSweep({ from: 60 * intensity, to: 120 * intensity, duration: 0.15, type: 'triangle', peak: 0.3 }),

  chestOpen: () => playSweep({ from: 220, to: 880, duration: 0.5, peak: 0.4 }),

  click: () => playSweep({ from: 600, to: 150, duration: 0.08, peak: 0.25 }),

  // chest-opening victory arpeggio
  victory: () => {
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    playNotes(
      freqs.map((freq, i) => ({ freq, start: i * 0.12, duration: 0.4, type: i === 3 ? 'sine' : 'triangle' })),
      { peak: 0.35, attack: 0.001 },
    );
  },
};
