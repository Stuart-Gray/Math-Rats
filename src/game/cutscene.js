/* Short in-engine cutscenes: the intro (Velma and Louise find their cage door open and climb down
   into the kitchen) and the ending (they discover the Legendary Snack Stash).
   A cutscene is a little script: a track of keyframes for each rat (where she is at each time;
   heading, walk cycle and slope tilt follow from her movement), a camera function, captions and
   sound cues. Everything is worked out from the time t, so skipping just jumps t to the end.
   Tap, click or press any key to skip. */
import { THREE } from '../lib/three.js';
import { $ } from '../lib/util.js';
import { game, world } from './state.js';
import { camera, heightAt } from '../rooms/world.js';
import { velma, louise } from '../rats/index.js';
import { sfx } from '../audio/audio.js';
import { syncPause } from '../ui/screens.js';
import { gameCam } from './camera.js';
import { CAGE, DOOR_AJAR, DOOR_OPEN } from '../rooms/cage.js';
import { PILE, HOLE_X } from '../rooms/stash.js';

const cine = $('cine'), cap = $('cineCap'), ttl = $('cineTitle');
const RATS = { v: velma, l: louise };
let cur = null; // { s: script, t, fired: Set, done }

const clamp01 = u => Math.max(0, Math.min(1, u));
const ease = u => { u = clamp01(u); return u * u * (3 - 2 * u); };
const seg = (t, a, b) => ease((t - a) / (b - a));
function angLerp(a, b, k) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; }

/* Position on a rat's track at time t: keys are [t, x, z] (+ optional heading to face when standing). */
function trackAt(keys, t, out) {
  if (t <= keys[0][0]) return out.set(keys[0][1], 0, keys[0][2]);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b[0]) { const u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]); return out.set(a[1] + (b[1] - a[1]) * u, 0, a[2] + (b[2] - a[2]) * u); }
  }
  const k = keys[keys.length - 1]; return out.set(k[1], 0, k[2]);
}
function faceAt(keys, t) { let h = null; for (const k of keys) { if (k[0] > t) break; if (k[3] != null) h = k[3]; } return h; }

const p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), camP = new THREE.Vector3(), camL = new THREE.Vector3(), tmpL = new THREE.Vector3(), tmpP = new THREE.Vector3();
/* Pose one rat for time t. snap = true when skipping (no smoothing). */
function poseRat(r, keys, t, dt, snap, extra) {
  trackAt(keys, t, p0); trackAt(keys, t + 0.06, p1);
  const dx = p1.x - p0.x, dz = p1.z - p0.z, sp = Math.hypot(dx, dz) / 0.06;
  const y0 = heightAt(p0.x, p0.z), y1 = heightAt(p1.x, p1.z);
  const k = snap ? 1 : Math.min(1, dt * 8);
  let face = sp > 0.3 ? Math.atan2(dx, dz) : faceAt(keys, t);
  if (face != null) r.heading = snap ? face : angLerp(r.heading, face, k);
  r.moving = snap ? 0 : (sp > 0.3 ? Math.min(1, r.moving + dt * 6) : Math.max(0, r.moving - dt * 5));
  const slope = sp > 0.3 ? Math.atan2(y0 - y1, Math.hypot(dx, dz)) : 0;
  const e = extra || {};
  r.pitch = snap ? slope : (r.pitch || 0) + (slope - (r.pitch || 0)) * k;
  r.g.position.set(p0.x, y0 + (e.lift || 0), p0.z);
  r.g.rotation.order = 'YXZ'; r.g.rotation.y = r.heading; r.g.rotation.x = r.pitch + (e.pitch || 0);
}

/* Camera: a list of shots [t, look[x,y,z] or fn(t), offset[x,y,z]]. Between shots it glides.
   On a tall phone screen the camera stands further back so the whole scene fits. */
function camAt(shots, t, pos, look) {
  const fit = camera.aspect < 0.8 ? 1.75 : camera.aspect < 1.2 ? 1.3 : 1;
  const ev = (s, P, L) => {
    if (s.game) { gameCam(velma.g.position, P, L); return; }
    const l = typeof s.look === 'function' ? s.look(t) : s.look;
    L.set(l[0], l[1], l[2]); P.set(l[0] + s.off[0] * fit, l[1] + s.off[1] * fit, l[2] + s.off[2] * fit);
  };
  let i = shots.findIndex(s => s.t > t);
  if (i < 0) { ev(shots[shots.length - 1], pos, look); return; }
  if (i === 0) { ev(shots[0], pos, look); return; }
  const a = shots[i - 1], b = shots[i], u = ease((t - a.t) / (b.t - a.t));
  ev(a, pos, look); ev(b, tmpP, tmpL); pos.lerp(tmpP, u); look.lerp(tmpL, u);
}

function caption(s, t) {
  const c = s.captions.find(c => t >= c[0] && t < c[1]);
  const key = c ? c.join('|') : '';
  if (cap.dataset.key !== key) {
    cap.dataset.key = key;
    if (!c) { cap.classList.remove('on'); return; }
    const who = c[2] === 'v' ? '<span class="who v">Velma</span>' : c[2] === 'l' ? '<span class="who l">Louise</span>' : '';
    cap.innerHTML = `${who}<span class="${c[2] === 'n' ? 'nar' : ''}">${c[3]}</span>`;
    cap.classList.remove('on'); void cap.offsetWidth; cap.classList.add('on');
  }
  const ti = s.title && t >= s.title[0] && t < s.title[1];
  ttl.classList.toggle('on', !!ti);
}

function apply(s, t, dt, snap) {
  const ex = s.extra ? s.extra(t) : {};
  for (const w of ['v', 'l']) poseRat(RATS[w], s.rats[w], t, dt, snap, ex[w]);
  if (s.pose) s.pose(t);
  camAt(s.shots, t, camP, camL);
  camera.position.copy(camP); camera.lookAt(camL);
}

/* Start a cutscene. onEnd runs once it finishes or is skipped. */
export function play(s, onEnd) {
  cur = { s, t: 0, fired: new Set(), onEnd, skipAt: performance.now() + 450 }; // ignore the tap that started it
  game.cutscene = true; syncPause();
  ttl.innerHTML = s.title ? s.title[2] : ''; cap.dataset.key = '-'; cap.classList.remove('on');
  document.body.classList.add('cine-on', 'hud-off'); cine.hidden = false;
  requestAnimationFrame(() => cine.classList.add('in'));
  for (const r of [velma, louise]) { r.pitch = 0; r.moving = 0; }
  apply(s, 0, 0, true);
}
export const cutsceneOn = () => !!cur;
/* For automated playtests (#debug): jump to time t. */
export function seek(t) { if (cur) { cur.t = t; for (const [at] of cur.s.cues) if (at < t) cur.fired.add(at); } }

/* Called by the game loop every frame while a cutscene plays. */
export function cutTick(dt) {
  if (!cur) return;
  const s = cur.s; cur.t += dt;
  const t = cur.t;
  for (const [at, fn] of s.cues) if (t >= at && !cur.fired.has(at)) { cur.fired.add(at); fn(); }
  apply(s, t, dt, false);
  caption(s, t);
  if (t >= s.dur) finish();
}
export function skip() {
  if (!cur || performance.now() < cur.skipAt) return;
  sfx('tap'); cur.t = cur.s.dur; apply(cur.s, cur.s.dur, 0, true); finish();
}
function finish() {
  if (!cur) return;
  const c = cur; cur = null;
  for (const r of [velma, louise]) { r.g.rotation.x = 0; r.pitch = 0; r.g.position.y = heightAt(r.g.position.x, r.g.position.z); }
  if (c.s.after) c.s.after();
  cine.classList.remove('in'); cap.classList.remove('on'); ttl.classList.remove('on');
  setTimeout(() => { if (!cur) cine.hidden = true; }, 450);
  document.body.classList.remove('cine-on');
  if (!c.s.keepHud) document.body.classList.remove('hud-off');
  game.cutscene = false; syncPause();
  if (c.onEnd) c.onEnd();
}

/* Tap, click or any key skips. */
cine.addEventListener('pointerdown', e => { e.preventDefault(); skip(); });
window.addEventListener('keydown', e => { if (!cur || ['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return; e.preventDefault(); e.stopImmediatePropagation(); skip(); }, true);

/* ---------- the intro: the cage door is open! ---------- */
export function introScript() {
  const C = CAGE, dz = C.doorZ0 + C.doorW / 2, out = C.face + 0.9, low = C.rampEnd + 0.5;
  const door = world.cage && world.cage.door;
  const vx = C.face - 1.15; // Velma's nose touches the door
  return {
    dur: 14.6,
    rats: {
      v: [[0, -8.3, 5.6, 0.9], [1.9, -8.3, 5.6, Math.PI / 2], [2.9, -8.3, 5.6], [4.2, vx - 0.2, dz], [5.7, vx - 0.2, dz, Math.PI / 2], [6.6, vx + 0.25, dz], [7.9, vx + 0.25, dz],
          [8.5, out, dz], [9.7, low, dz], [11.0, 0, 5], [11.6, 0, 5, Math.PI]],
      l: [[0, -9.4, 4.1, 0.6], [3.2, -9.4, 4.1, 1.2], [4.0, -9.4, 4.1], [5.0, -8.9, 4.4, Math.PI / 2], [8.2, -8.9, 4.4], [8.9, vx - 0.2, dz], [9.4, out, dz], [10.6, low, dz], [11.8, -1.15, 5.15], [12.4, -1.15, 5.15, Math.PI]],
    },
    pose: t => { if (door) door.rotation.y = DOOR_AJAR + (DOOR_OPEN - DOOR_AJAR) * seg(t, 5.9, 7.4) + Math.sin(Math.max(0, t - 7.4) * 9) * 0.06 * Math.max(0, 1 - (t - 7.4)) * (t > 7.4 ? 1 : 0); },
    extra: t => ({ v: { pitch: t > 4.4 && t < 5.6 ? Math.sin((t - 4.4) * 14) * 0.05 + 0.08 : 0 } }), // a careful sniff at the door
    shots: [
      { t: 0, look: [C.x, 2.6, C.z], off: [10, 5.5, 9] },
      { t: 2.6, look: [C.x + 0.5, 2.3, C.z], off: [6.2, 2.4, 6.4] },
      { t: 5.2, look: [C.face - 0.3, 2.2, dz], off: [5, 1.6, 4.6] },
      { t: 7.6, look: [C.face - 0.3, 2.1, dz], off: [5.2, 1.8, 4.8] },
      { t: 9.6, look: t => [velma.g.position.x, velma.g.position.y + 0.9, velma.g.position.z], off: [5, 3, 7] },
      { t: 11.2, look: t => [velma.g.position.x - 0.5, 1, velma.g.position.z], off: [5.5, 4, 8] },
      { t: 14.6, game: true },
    ],
    captions: [
      [0.3, 2.8, 'n', 'One sleepy morning, in a cozy cage in the kitchen…'],
      [2.8, 5.6, 'v', 'Louise! Somebody forgot to latch the cage door!'],
      [5.6, 8.0, 'l', 'Gently does it, Velma. Nose first…'],
      [8.0, 11.0, 'v', 'A whole house to explore. And I can smell toast!'],
      [11.0, 14.4, 'l', 'Somewhere up there is the Legendary Snack Stash. Let’s find it!'],
    ],
    title: [11.4, 14.4, '<span class="k">A two-rat algebra adventure</span><b>House of <em>X</em></b>'],
    cues: [[2.0, () => sfx('sniff')], [4.5, () => sfx('sniff')], [5.9, () => sfx('creak')], [8.4, () => sfx('patter')], [9.3, () => sfx('patter')], [10.2, () => sfx('patter')], [11.4, () => sfx('level')]],
    after: () => { if (door) door.rotation.y = DOOR_OPEN; },
  };
}

/* ---------- the ending: the Legendary Snack Stash ---------- */
export function endingScript() {
  const P = PILE, hz = -9.3, ex = P.x - P.r - 1.2;
  const nib = (t, a) => (t > a && t < 15.5 ? 0.22 + Math.sin(t * 13) * 0.1 : 0);
  return {
    dur: 18,
    keepHud: true,
    rats: {
      v: [[0, HOLE_X, hz, 0], [0.6, HOLE_X, hz], [2.4, HOLE_X, -5.2], [3.6, -3.6, -3.4], [4.2, -3.6, -3.4, 1.45], [9.6, -3.6, -3.4], [10.8, ex, -3.3], [11.2, ex, -3.3, 1.5]],
      l: [[0, HOLE_X, hz, 0], [1.5, HOLE_X, hz], [3.2, HOLE_X, -5.4], [4.3, -3.8, -1.9], [4.8, -3.8, -1.9, 1.45], [9.9, -3.8, -1.9], [11.1, ex + 0.3, -1.7], [11.5, ex + 0.3, -1.7, 1.6]],
    },
    // rear up in awe at the pile, then nibble nibble nibble
    extra: t => {
      const awe = seg(t, 6.2, 6.8) * (1 - seg(t, 9.0, 9.6));
      return { v: { pitch: -0.6 * awe + nib(t, 11.3), lift: 0.5 * awe }, l: { pitch: -0.55 * seg(t, 6.6, 7.2) * (1 - seg(t, 9.3, 9.9)) + nib(t, 11.7), lift: 0.45 * seg(t, 6.6, 7.2) * (1 - seg(t, 9.3, 9.9)) } };
    },
    shots: [
      { t: 0, look: [HOLE_X, 0.8, -6.5], off: [4.5, 2.2, 7] },
      { t: 2.6, look: [HOLE_X + 0.8, 0.9, -5.2], off: [5, 2.4, 7.5] },
      { t: 4.4, look: [P.x - 1, 1.5, P.z - 0.1], off: [-11.2, 1.2, 0.4] }, // over the rats' shoulders: the reveal
      { t: 6.0, look: [P.x - 0.5, 1.9, P.z - 0.1], off: [-10.6, 1.0, 0.3] },
      { t: 8.0, look: [-3.4, 1.0, -2.6], off: [4.5, 1.4, 5] },          // their faces, in awe
      { t: 10.0, look: [-3.2, 1.0, -2.6], off: [4.7, 1.5, 5.2] },
      { t: 12.2, look: [P.x - 1.5, 1.4, P.z + 0.3], off: [3.5, 3, 7.5] },
      { t: 14.8, look: [P.x - 1.5, 1.6, P.z + 0.3], off: [4.5, 4.5, 9] },
      { t: 18, look: [P.x - 1.5, 2.2, P.z], off: [6, 9, 13] },
    ],
    captions: [
      [0.3, 2.8, 'n', 'Through the very last mouse hole…'],
      [3.6, 6.2, 'v', 'Louise. LOUISE. Are you seeing this?'],
      [6.2, 9.8, 'l', 'Sunflower seeds. Three whole crackers. And one… perfect… blueberry.'],
      [10.2, 12.8, 'v', 'We share it, obviously.'],
      [12.8, 15.2, 'l', 'Obviously. We’re sisters.'],
    ],
    title: [15.0, 18, '<span class="k">You found it!</span><b>The Legendary Snack Stash</b>'],
    cues: [[0.7, () => sfx('patter')], [1.6, () => sfx('patter')], [4.4, () => sfx('sparkle')], [6.3, () => sfx('squeak')], [11.4, () => sfx('crunch')], [12.6, () => sfx('crunch')], [13.8, () => sfx('crunch')], [15.0, () => sfx('fanfare')]],
  };
}
