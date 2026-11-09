let ctx: AudioContext | null = null;
let master: GainNode;
let hiss: GainNode;
let roar: GainNode;
let noiseBuf: AudioBuffer;
let musicGain: GainNode | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
const musicNodes = new Set<OscillatorNode>();

function noiseSrc() {
  if (!ctx) throw new Error("Audio not initialized");
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

function env(g: GainNode, t: number, peak: number, a: number, d: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

export const audio = {
  init() {
    if (ctx) {
      if (ctx.state === "suspended") void ctx.resume();
      return;
    }
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    master = ctx.createGain();
    master.gain.value = 0.75;
    master.connect(comp).connect(ctx.destination);

    // Generate stereo noise buffer
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // Cockpit / Spacecraft internal low rumble
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 140;
    const hg = ctx.createGain();
    hg.gain.value = 0.08;
    lp.connect(hg).connect(master);
    for (const f of [52, 53.2, 104.5]) {
      const o = ctx.createOscillator();
      o.type = f > 100 ? "sine" : "sawtooth";
      o.frequency.value = f;
      o.connect(lp);
      o.start();
    }

    // Gentle life-support air circulation
    const air = noiseSrc();
    air.loop = true;
    const af = ctx.createBiquadFilter();
    af.type = "lowpass";
    af.frequency.value = 280;
    const ag = ctx.createGain();
    ag.gain.value = 0.02;
    air.connect(af).connect(ag).connect(master);
    air.start();

    // RCS thruster hiss bed
    const hs = noiseSrc();
    hs.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2100;
    bp.Q.value = 0.7;
    hiss = ctx.createGain();
    hiss.gain.value = 0;
    hs.connect(bp).connect(hiss).connect(master);
    hs.start();

    // Hypersonic reentry / burn-up roar
    const rs = noiseSrc();
    rs.loop = true;
    const rlp = ctx.createBiquadFilter();
    rlp.type = "lowpass";
    rlp.frequency.value = 450;
    roar = ctx.createGain();
    roar.gain.value = 0;
    rs.connect(rlp).connect(roar).connect(master);
    rs.start();
  },

  suspend(on: boolean) {
    if (!ctx) return;
    if (on) void ctx.suspend();
    else void ctx.resume();
  },

  setHiss(v: number) {
    if (!ctx) return;
    hiss.gain.setTargetAtTime(Math.min(0.2, v * 0.09), ctx.currentTime, 0.04);
  },

  setRoar(v: number) {
    if (!ctx) return;
    roar.gain.setTargetAtTime(Math.min(0.35, v * 0.25), ctx.currentTime, 0.08);
  },

  /** Sub-bass impulse when firing main thrusters or boost */
  thud(freq = 65, duration = 0.22, vol = 0.45) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(24, t + duration);
    env(g, t, vol, 0.01, duration);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + duration + 0.05);
  },

  /** Telemetry beep / alarm */
  beep(freq = 1200, duration = 0.08, vol = 0.18) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, t);
    env(g, t, vol, 0.005, duration);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + duration + 0.02);
  },

  /** Bingo fuel warning siren */
  bingoWarning() {
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(880, t);
    o.frequency.setValueAtTime(660, t + 0.1);
    env(g, t, 0.15, 0.01, 0.22);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.25);
  },

  /** Mechanical latch / soft robotic capture lock */
  grappleLock() {
    if (!ctx) return;
    const t = ctx.currentTime;
    // Servo motor whir
    const s = ctx.createOscillator();
    const sg = ctx.createGain();
    s.type = "triangle";
    s.frequency.setValueAtTime(320, t);
    s.frequency.linearRampToValueAtTime(740, t + 0.25);
    env(sg, t, 0.25, 0.02, 0.25);
    s.connect(sg).connect(master);
    s.start(t);
    s.stop(t + 0.3);

    // Heavy metallic mechanical latch clunk
    setTimeout(() => {
      if (!ctx) return;
      const t2 = ctx.currentTime;
      const cl = ctx.createOscillator();
      const cg = ctx.createGain();
      cl.type = "square";
      cl.frequency.setValueAtTime(160, t2);
      cl.frequency.exponentialRampToValueAtTime(40, t2 + 0.15);
      env(cg, t2, 0.35, 0.005, 0.15);
      cl.connect(cg).connect(master);
      cl.start(t2);
      cl.stop(t2 + 0.2);
    }, 240);
  },

  /** Atmospheric Debris Disintegration explosion shockwave */
  disintegrationExplosion() {
    if (!ctx) return;
    const t = ctx.currentTime;
    // Sub-bass detonation
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(95, t);
    o.frequency.exponentialRampToValueAtTime(20, t + 0.8);
    env(g, t, 0.6, 0.02, 0.8);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.85);

    // Atmospheric roar crackle
    const n = noiseSrc();
    const flt = ctx.createBiquadFilter();
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(800, t);
    flt.frequency.exponentialRampToValueAtTime(120, t + 1.2);
    const ng = ctx.createGain();
    env(ng, t, 0.45, 0.05, 1.2);
    n.connect(flt).connect(ng).connect(master);
    n.start(t);
    n.stop(t + 1.3);
  },

  /** Mothership Fast Recharge chime */
  rechargeHum(progress: number) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    const freq = 400 + progress * 600;
    o.frequency.setValueAtTime(freq, t);
    env(g, t, 0.12, 0.01, 0.08);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.09);
  },

  /** Mission Control Voice Callout */
  voice(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.pitch = 1.0;
      u.volume = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const eng = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel")));
      if (eng) u.voice = eng;
      window.speechSynthesis.speak(u);
    } catch {
      // Audio fallback already provides beeps
    }
  },

  /** Ambient procedural space synth score */
  music(on: boolean) {
    if (!ctx) return;
    const context = ctx;
    if (musicGain) {
      musicGain.gain.setTargetAtTime(on ? 0.35 : 0, context.currentTime, 0.8);
      return;
    }
    if (!on) return;

    const bus = context.createGain();
    musicGain = bus;
    bus.gain.setValueAtTime(0, context.currentTime);
    bus.gain.setTargetAtTime(0.35, context.currentTime, 2.0);
    bus.connect(master);

    // Deep cosmic drone chords (D minor / F maj9 aesthetic)
    const chords = [
      [146.83, 220.0, 261.63, 329.63], // D3, A3, C4, E4 (Dm9)
      [130.81, 196.0, 246.94, 329.63], // C3, G3, B3, E4 (Cmaj7)
      [116.54, 174.61, 233.08, 293.66], // Bb2, F3, Bb3, D4 (Bb)
      [110.0, 164.81, 220.0, 261.63], // A2, E3, A3, C4 (Am)
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!ctx || !musicGain) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;
      const now = context.currentTime;
      notes.forEach((freq, idx) => {
        const osc = context.createOscillator();
        const g = context.createGain();
        osc.type = idx === 0 ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq, now);

        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(260 + Math.random() * 80, now);

        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(0.045 / (idx + 1), now + 3.0);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 8.5);

        osc.connect(filter).connect(g).connect(bus);
        osc.start(now);
        osc.stop(now + 9.0);
        musicNodes.add(osc);
        setTimeout(() => musicNodes.delete(osc), 9500);
      });
    };

    playChord();
    musicTimer = setInterval(playChord, 8000);
  },

  stopMusic() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    if (musicGain && ctx) {
      musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    }
    musicNodes.forEach((n) => {
      try {
        n.stop();
      } catch {
        // Ignored
      }
    });
    musicNodes.clear();
  },
};
