export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this._buffers = new Map();
    this._musicNode = null;
  }

  unlock() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
  }

  async _loadBuffer(url) {
    if (!this.ctx) return null;
    if (this._buffers.has(url)) return this._buffers.get(url);

    try {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      const audio = await this.ctx.decodeAudioData(buf.slice(0));
      this._buffers.set(url, audio);
      return audio;
    } catch {
      this._buffers.set(url, null);
      return null;
    }
  }

  stopMusic() {
    if (!this._musicNode) return;
    try {
      this._musicNode.stop?.();
    } catch {}
    try {
      this._musicNode.disconnect?.();
    } catch {}
    this._musicNode = null;
  }

  async playBattleMusic() {
    if (!this.ctx || !this.master) return;
    this.stopMusic();

    const buffer = await this._loadBuffer("assets/sounds/battle_theme.mp3");
    if (buffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(this.master);
      src.start();
      this._musicNode = src;
      return;
    }

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "square";
    osc2.type = "square";
    osc1.frequency.value = 110;
    osc2.frequency.value = 220;
    osc2.detune.value = -8;
    gain.gain.value = 0.0;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.master);
    osc1.start();
    osc2.start();

    const start = this.ctx.currentTime;
    const step = () => {
      if (!this.ctx || this._musicNode !== node) return;
      const t = this.ctx.currentTime - start;
      const seq = [110, 110, 165, 220, 196, 165, 147, 110];
      const i = Math.floor((t * 4) % seq.length);
      const f = seq[i];
      osc1.frequency.setValueAtTime(f, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(f * 2, this.ctx.currentTime);
      gain.gain.setTargetAtTime(0.12, this.ctx.currentTime, 0.01);
      requestAnimationFrame(step);
    };

    const node = {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
        } catch {}
      },
      disconnect: () => {
        try {
          osc1.disconnect();
          osc2.disconnect();
          gain.disconnect();
        } catch {}
      },
    };
    this._musicNode = node;
    requestAnimationFrame(step);
  }

  async playHit() {
    if (!this.ctx || !this.master) return;

    const buffer = await this._loadBuffer("assets/sounds/hit.wav");
    if (buffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(this.master);
      src.start();
      return;
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 440;
    gain.gain.value = 0.18;
    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }
}

