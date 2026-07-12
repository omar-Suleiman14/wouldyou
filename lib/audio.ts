// Web Audio API Synthesizer for WouldYou Interactive Experience

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.isAmbientPlaying) {
      this.stopAmbient();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play a playful pitch-bending "whoosh/boing" when No button escapes
   */
  public playEscapeSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Alternate between a rising boing and a falling zip
      const isRising = Math.random() > 0.4;
      const startFreq = isRising ? 220 : 640;
      const endFreq = isRising ? 680 : 180;

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio context might not be allowed yet
    }
  }

  /**
   * Play a joyful 6-note celebration fanfare when Yes is clicked
   */
  public playYesFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Major pentatonic arpeggio: C5, E5, G5, A5, C6, E6
      const notes = [523.25, 659.25, 783.99, 880.0, 1046.5, 1318.51];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.55);
      });

      // Extra shimmering chord sparkle
      setTimeout(() => {
        if (!this.ctx) return;
        const chordNotes = [1046.5, 1318.51, 1567.98];
        const chordNow = this.ctx.currentTime;
        chordNotes.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, chordNow);
          gain.gain.setValueAtTime(0.1, chordNow);
          gain.gain.exponentialRampToValueAtTime(0.001, chordNow + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(chordNow);
          osc.stop(chordNow + 1.25);
        });
      }, 450);
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Crisp UI click for button hovers and option selection
   */
  public playClickSound(pitch: number = 800): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * Toggle warm, relaxing Studio Ghibli inspired ambient background pad
   */
  public toggleAmbient(): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    if (this.isAmbientPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  private startAmbient(): void {
    const ctx = this.getContext();
    if (!ctx || this.isAmbientPlaying) return;

    try {
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2); // Gentle fade in
      this.ambientGain.connect(ctx.destination);

      // Warm F major 7th chord frequencies: F3 (174.61), A3 (220), C4 (261.63), E4 (329.63)
      const frequencies = [174.61, 220.0, 261.63, 329.63];

      this.ambientOscillators = frequencies.map((freq) => {
        const osc = ctx.createOscillator();
        // Soft sine + slight LFO modulation effect simulated via detune
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);

        osc.connect(this.ambientGain!);
        osc.start();
        return osc;
      });

      this.isAmbientPlaying = true;
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  private stopAmbient(): void {
    const ctx = this.ctx;
    if (!ctx || !this.ambientGain) {
      this.ambientOscillators.forEach((o) => {
        try { o.stop(); } catch {}
      });
      this.ambientOscillators = [];
      this.isAmbientPlaying = false;
      return;
    }

    try {
      // Gentle fade out over 1.5s
      this.ambientGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      setTimeout(() => {
        this.ambientOscillators.forEach((osc) => {
          try { osc.stop(); } catch {}
        });
        this.ambientOscillators = [];
        this.isAmbientPlaying = false;
      }, 1600);
    } catch {
      this.ambientOscillators = [];
      this.isAmbientPlaying = false;
    }
  }
}

export const soundEngine = new SoundEngine();
