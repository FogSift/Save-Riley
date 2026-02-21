/**
 * sounds/audio.js
 * Tiny Web Audio API sound engine — no dependencies, no files.
 * AudioContext is created lazily on first user interaction, which satisfies
 * browser autoplay policies. All sounds will silently no-op if audio is
 * unavailable or if the context hasn't been unlocked yet.
 */

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

/**
 * Play a single oscillator tone.
 * @param {number} freq     - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {OscillatorType} type   - 'sine' | 'square' | 'sawtooth' | 'triangle'
 * @param {number} volume   - Peak gain (0–1, keep below 0.3 to avoid clipping)
 */
function tone(freq, duration, type = 'sine', volume = 0.12) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch { /* silently fail if audio unavailable */ }
}

export const sounds = {
  /** Riley sends a message — soft blip */
  message: () => tone(660, 0.07, 'sine', 0.06),

  /** Positive stage progression — ascending three-note chime */
  stageUp: () => {
    tone(523, 0.1, 'sine', 0.10);
    setTimeout(() => tone(659, 0.1, 'sine', 0.10), 120);
    setTimeout(() => tone(784, 0.2, 'sine', 0.12), 240);
  },

  /** JITTER / hostile screen effect — low sawtooth burst */
  jitter: () => {
    tone(80,  0.40, 'sawtooth', 0.08);
    tone(120, 0.30, 'square',   0.05);
  },

  /** Warning / alert — descending sawtooth */
  alert: () => {
    tone(220, 0.15, 'sawtooth', 0.10);
    setTimeout(() => tone(165, 0.30, 'sawtooth', 0.08), 160);
  },

  /** Hostile lockdown alarm — harsh pulse */
  lockdown: () => {
    [200, 0, 200, 0, 200].forEach((freq, i) => {
      if (freq > 0) setTimeout(() => tone(freq, 0.2, 'sawtooth', 0.12), i * 200);
    });
  },

  /** True Escape / game complete — triumphant ascending arpeggio */
  escape: () => {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => tone(f, 0.3, 'sine', 0.10), i * 150);
    });
  },
};
