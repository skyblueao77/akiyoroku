/**
 * Web Audio API based ambient sound generator for autumn nights
 * Generates:
 * 1. Autumn crickets (鈴虫 / 秋の虫) - FM synthesis & tremolo
 * 2. Fireplace crackle (暖炉の薪) - filtered noise with stochastic bursts
 * 3. Gentle night rain (静かな秋雨) - low-pass filtered noise
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlayingCricket: boolean = false;
  private isPlayingFire: boolean = false;
  private isPlayingRain: boolean = false;

  private cricketGain: GainNode | null = null;
  private fireGain: GainNode | null = null;
  private rainGain: GainNode | null = null;

  private cricketInterval: any = null;
  private fireInterval: any = null;
  private rainNode: AudioNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- 1. CRICKETS (秋の虫・鈴虫) ---
  toggleCrickets(enable: boolean, volume: number = 0.3) {
    this.initContext();
    if (!this.ctx) return;

    if (!enable) {
      this.isPlayingCricket = false;
      if (this.cricketInterval) clearInterval(this.cricketInterval);
      if (this.cricketGain) {
        this.cricketGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      }
      return;
    }

    this.isPlayingCricket = true;
    if (!this.cricketGain) {
      this.cricketGain = this.ctx.createGain();
      this.cricketGain.connect(this.ctx.destination);
    }
    this.cricketGain.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);

    const playChirp = () => {
      if (!this.ctx || !this.isPlayingCricket || !this.cricketGain) return;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Subtle vibrato/tremolo
      const now = this.ctx.currentTime;
      const freq = 4200 + Math.random() * 600; // high crisp cricket frequency
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(0, now);
      // Repeated rhythmic trills (リンリンリン...)
      const pulses = 3 + Math.floor(Math.random() * 4);
      let t = now;
      for (let i = 0; i < pulses; i++) {
        oscGain.gain.setValueAtTime(0.01, t);
        oscGain.gain.linearRampToValueAtTime(0.18, t + 0.03);
        oscGain.gain.linearRampToValueAtTime(0.01, t + 0.07);
        t += 0.08;
      }

      osc.connect(oscGain);
      oscGain.connect(this.cricketGain);
      osc.start(now);
      osc.stop(t + 0.1);
    };

    playChirp();
    this.cricketInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        playChirp();
      }
    }, 1800);
  }

  // --- 2. FIREPLACE (暖炉の薪の音) ---
  toggleFireplace(enable: boolean, volume: number = 0.3) {
    this.initContext();
    if (!this.ctx) return;

    if (!enable) {
      this.isPlayingFire = false;
      if (this.fireInterval) clearInterval(this.fireInterval);
      if (this.fireGain) {
        this.fireGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      }
      return;
    }

    this.isPlayingFire = true;
    if (!this.fireGain) {
      this.fireGain = this.ctx.createGain();
      this.fireGain.connect(this.ctx.destination);
    }
    this.fireGain.gain.setValueAtTime(volume * 0.5, this.ctx.currentTime);

    // Crackle pops
    const playPop = () => {
      if (!this.ctx || !this.isPlayingFire || !this.fireGain) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800 + Math.random() * 1800;
      filter.Q.value = 3;

      const popGain = this.ctx.createGain();
      popGain.gain.setValueAtTime(0.05 + Math.random() * 0.15, now);

      whiteNoise.connect(filter);
      filter.connect(popGain);
      popGain.connect(this.fireGain);

      whiteNoise.start(now);
    };

    this.fireInterval = setInterval(() => {
      const bursts = Math.floor(Math.random() * 3);
      for (let i = 0; i < bursts; i++) {
        setTimeout(playPop, Math.random() * 200);
      }
    }, 350);
  }

  // --- 3. GENTLE RAIN (秋の雨) ---
  toggleRain(enable: boolean, volume: number = 0.3) {
    this.initContext();
    if (!this.ctx) return;

    if (!enable) {
      this.isPlayingRain = false;
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      }
      return;
    }

    this.isPlayingRain = true;
    if (!this.rainGain) {
      this.rainGain = this.ctx.createGain();
      this.rainGain.connect(this.ctx.destination);
    }
    this.rainGain.gain.setValueAtTime(volume * 0.25, this.ctx.currentTime);

    // Continuous pink-ish noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.3;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1200;

    whiteNoise.connect(lowpass);
    lowpass.connect(this.rainGain);
    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  stopAll() {
    this.toggleCrickets(false);
    this.toggleFireplace(false);
    this.toggleRain(false);
  }
}

export const ambientSound = new AmbientSoundEngine();
