/* Cozy background music and sound effects, all synthesized with Web Audio (no audio files).
   Each run (and each room) gets a different tune built from the same gentle ingredients:
   jazzy seventh-chord pads, a soft bass, and a music-box style melody. */
import { settings, saveSettings } from '../progress/storage.js';
import { pick, rnd } from '../lib/util.js';

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

/* Chord progressions in C (MIDI notes), transposed per song. */
const PROGS = [
  { name: 'Sunny windowsill', key: 65, ch: [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 57]] },   // the original tune
  { name: 'Crumbs on the counter', key: 60, ch: [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]] },
  { name: 'Sock nest lullaby', key: 60, ch: [[50, 53, 57, 60], [43, 47, 50, 53], [48, 52, 55, 59], [45, 48, 52, 55]] },
  { name: 'Tiptoe past the cat', key: 60, ch: [[45, 48, 52, 55], [41, 45, 48, 52], [48, 52, 55, 59], [43, 47, 50, 55]] },
  { name: 'Bubble bath waltz', key: 60, ch: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [43, 47, 50, 53], [48, 52, 55, 60], [46, 50, 53, 57]] },
  { name: 'Attic stargazing', key: 60, ch: [[41, 45, 48, 52], [43, 47, 50, 53], [40, 43, 47, 50], [45, 48, 52, 55]] },
];
const PENTA = [0, 2, 4, 7, 9];
const STYLES = ['sprinkle', 'arp', 'phrase'];
const LEADS = ['bell', 'pluck', 'flute'];

function makeSong(avoid) {
  let i; do { i = rnd(0, PROGS.length - 1); } while (i === avoid && PROGS.length > 1);
  const shift = pick([-2, 0, 0, 2, 3, -3]);
  return {
    i, name: PROGS[i].name, shift,
    chords: PROGS[i].ch.map(c => c.map(m => m + shift)),
    bar: pick([2.8, 3.0, 3.2, 3.4]),
    style: pick(STYLES), lead: pick(LEADS),
    shaker: Math.random() < 0.45, walkBass: Math.random() < 0.5,
    scale: [0, 1].flatMap(o => PENTA.map(p => PROGS[i].key + shift + o * 12 + p)).filter(m => m >= 62 + shift && m <= 81 + shift), // major pentatonic of the song's key
  };
}

export const audio = {
  ctx: null, master: null, mus: null, fx: null, timer: null, next: 0, bar: 0, song: null, noise: null, phrase: 0,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); this.apply(); return; }
    try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; this.ctx = new C(); } catch (e) { return; }
    const c = this.ctx; this.master = c.createGain(); this.master.connect(c.destination);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.connect(this.master);
    this.mus = c.createGain(); this.mus.gain.value = 0; this.mus.connect(lp);
    this.fx = c.createGain(); this.fx.gain.value = 0.45; this.fx.connect(this.master);
    const buf = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate), d = buf.getChannelData(0);
    for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
    this.noise = buf;
    if (!this.song) this.newSong();
    this.apply();
  },
  /* Pick a fresh tune, never the same progression twice in a row. */
  newSong() {
    this.song = makeSong(settings.lastSong);
    settings.lastSong = this.song.i; saveSettings();
    this.bar = 0;
    if (this.ctx) this.next = Math.max(this.next, this.ctx.currentTime + 0.4);
    return this.song.name;
  },
  apply() {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    this.mus.gain.setTargetAtTime(settings.music ? 0.32 * settings.vol : 0, t, 0.4);
    this.fx.gain.setTargetAtTime(settings.sfx && settings.vol > 0 ? 0.45 * Math.max(0.3, Math.min(1, settings.vol * 1.4)) : 0, t, 0.05);
    if (settings.music && !this.timer) { this.next = Math.max(this.next, t + 0.1); this.timer = setInterval(() => this.schedule(), 250); }
    if (!settings.music && this.timer) { clearInterval(this.timer); this.timer = null; }
  },
  tone(f, t0, dur, { type = 'sine', vol = 0.2, dest = this.fx, f2 = null, attack = 0.01 } = {}) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.05);
  },
  hiss(t0, dur, vol, freq = 6000, dest = this.mus) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = 'highpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t0); s.stop(t0 + dur + 0.02);
  },
  note(m, t, len) {
    const L = this.song.lead, d = this.mus;
    if (L === 'bell') { this.tone(mtof(m), t, 1.4, { vol: 0.05, dest: d, attack: 0.005 }); this.tone(mtof(m) * 2, t, 0.6, { vol: 0.012, dest: d, attack: 0.005 }); }
    else if (L === 'pluck') { this.tone(mtof(m), t, 0.7, { type: 'triangle', vol: 0.06, dest: d, attack: 0.004 }); this.tone(mtof(m) * 3, t, 0.15, { vol: 0.008, dest: d, attack: 0.002 }); }
    else { this.tone(mtof(m), t, Math.max(0.6, len), { vol: 0.04, dest: d, attack: 0.08 }); this.tone(mtof(m) * 2.001, t, Math.max(0.5, len * 0.8), { vol: 0.006, dest: d, attack: 0.1 }); }
  },
  schedule() {
    const c = this.ctx; if (!c || !this.song) return; const S = this.song, BAR = S.bar, step = BAR / 8;
    while (this.next < c.currentTime + 0.8) {
      const t = this.next, ch = S.chords[this.bar % S.chords.length];
      // pad: two voices per note, slightly detuned
      ch.forEach(m => { [0, 4].forEach(det => {
        const o = c.createOscillator(), g = c.createGain(); o.type = det ? 'triangle' : 'sine'; o.frequency.value = mtof(m); o.detune.value = det;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(det ? 0.012 : 0.03, t + 1.0); g.gain.setValueAtTime(det ? 0.012 : 0.03, t + BAR - 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + BAR + 0.9);
        o.connect(g); g.connect(this.mus); o.start(t); o.stop(t + BAR + 1); }); });
      // bass
      if (S.walkBass) { this.tone(mtof(ch[0] - 12), t, BAR / 2, { vol: 0.05, dest: this.mus, attack: 0.05 }); this.tone(mtof(ch[2] - 12), t + BAR / 2, BAR / 2, { vol: 0.04, dest: this.mus, attack: 0.05 }); }
      else this.tone(mtof(ch[0] - 12), t, BAR, { vol: 0.05, dest: this.mus, attack: 0.3 });
      // melody
      const top = ch.map(m => m + 12);
      if (S.style === 'sprinkle') {
        for (let s = 0; s < 8; s++) if (Math.random() < 0.32) this.note(pick(S.scale), t + s * step + Math.random() * 0.03, step * 2);
      } else if (S.style === 'arp') {
        const pat = [0, 1, 2, 3, 2, 1, 0, 1];
        for (let s = 0; s < 8; s++) if (s % 2 === 0 || Math.random() < 0.4) this.note(top[pat[s]], t + s * step, step * 1.5);
      } else {
        // little phrases that wander up and down the pentatonic scale, with rests
        let k = this.phrase;
        for (let s = 0; s < 8; s++) {
          if (Math.random() < (s % 2 ? 0.35 : 0.7)) { k = Math.max(0, Math.min(S.scale.length - 1, k + pick([-2, -1, -1, 1, 1, 2]))); this.note(S.scale[k], t + s * step, step * 2); }
        }
        this.phrase = k;
      }
      if (S.shaker) for (let s = 0; s < 8; s++) this.hiss(t + s * step, 0.06, s % 2 ? 0.004 : 0.008);
      this.next += BAR; this.bar++;
    }
  },
};

export function sfx(name) {
  if (!audio.ctx || !settings.sfx) return; const t = audio.ctx.currentTime + 0.01, T = (f, d, dt, o) => audio.tone(f, t + dt, d, o);
  if (name === 'crumb') { T(880, 0.12, 0, { vol: 0.18 }); T(1320, 0.16, 0.07, { vol: 0.15 }); }
  else if (name === 'good') { [523, 659, 784, 1047].forEach((f, i) => T(f, 0.35, i * 0.07, { vol: 0.16, type: 'triangle' })); }
  else if (name === 'step') { T(659, 0.18, 0, { vol: 0.14, type: 'triangle' }); T(988, 0.25, 0.07, { vol: 0.12, type: 'triangle' }); }
  else if (name === 'oops') { T(330, 0.3, 0, { vol: 0.13, type: 'triangle', f2: 240 }); }
  else if (name === 'slash') { T(1800, 0.12, 0, { vol: 0.05, type: 'sawtooth', f2: 600 }); }
  else if (name === 'door') { T(300, 0.7, 0, { vol: 0.15, f2: 900 }); T(450, 0.7, 0.1, { vol: 0.08, f2: 1350 }); }
  else if (name === 'level') { [1047, 1319, 1568, 2093].forEach((f, i) => T(f, 0.4, i * 0.08, { vol: 0.1 })); }
  else if (name === 'tap') { T(700, 0.06, 0, { vol: 0.07 }); }
  else if (name === 'key') { T(1200, 0.04, 0, { vol: 0.05, type: 'triangle' }); }
  else if (name === 'pop') { T(500, 0.08, 0, { vol: 0.08, f2: 900 }); }
  else if (name === 'squeak') { T(1800, 0.09, 0, { vol: 0.07, f2: 2600 }); T(2200, 0.1, 0.11, { vol: 0.06, f2: 3000 }); }
  else if (name === 'zoom') { [0, 0.08, 0.16, 0.24].forEach((dt, i) => T(900 + i * 300, 0.1, dt, { vol: 0.08, type: 'triangle', f2: 1400 + i * 300 })); }
  else if (name === 'splash') { audio.hiss(t, 0.35, 0.06, 1500, audio.fx); T(400, 0.2, 0, { vol: 0.05, f2: 900 }); }
}

document.addEventListener('visibilitychange', () => { if (!audio.ctx) return; if (document.hidden) audio.ctx.suspend(); else audio.ctx.resume(); });
