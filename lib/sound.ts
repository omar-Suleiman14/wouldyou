// Two small synthesized sounds: the No button escaping, and a short chime on yes.
// Off for people who ask for reduced motion, and mutable from the page.

const MUTE_KEY = "wouldu:muted";

class Sound {
  private ctx: AudioContext | null = null;
  muted = false;

  constructor() {
    if (typeof window === "undefined") return;
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === "1" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      this.muted = false;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {}
  }

  private context(): AudioContext | null {
    if (this.muted || typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private tone(freq: number, endFreq: number, start: number, length: number, volume: number, type: OscillatorType) {
    const ctx = this.context();
    if (!ctx) return;
    const t = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + length);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + length + 0.02);
  }

  escape() {
    const up = Math.random() > 0.5;
    this.tone(up ? 260 : 720, up ? 720 : 240, 0, 0.18, 0.16, "triangle");
  }

  yes() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, f, i * 0.07, 0.4, 0.12, "sine"));
  }
}

export const sound = new Sound();
