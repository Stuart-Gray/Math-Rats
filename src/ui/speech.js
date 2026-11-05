/* Who says what, and where.
   - Gameplay messages (tips, "the mouse hole is open", level changes) use the bar at the bottom
     of the screen, one at a time.
   - Velma and Louise's jokes and chatter pop up as see-through speech bubbles above whichever rat
     is talking, one bubble at a time, like a conversation. Little chatter is skipped when they are
     already talking, and a real line (a joke, a story line) replaces chatter instead of waiting.
   Lines stay long enough to read (based on length and the "speech bubbles stay" setting), pause
   while a puzzle or menu is open, and close with the × (bar) or a tap (rat bubble). */
import { THREE } from '../lib/three.js';
import { $ } from '../lib/util.js';
import { settings } from '../progress/storage.js';
import { sfx } from '../audio/audio.js';

export function who(w) {
  return w === 'v' ? '<span class="who v">Velma</span>' : w === 'l' ? '<span class="who l">Louise</span>' : '<span class="who n">Psst</span>';
}
/* Reading time: about 0.4 s per word on top of 3 s, never less than 5 s. */
function readMs(text) {
  const words = text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(5000, 3000 + words * 400);
}

let scene = 0;
const barQ = [], ratQ = [];
let bar = null, rat = null, ratGap = 0, hidden = false;
const MAX_RAT_QUEUE = 4;

/* opts.front puts the line first (room intros). opts.minor lines (little chatter) are skipped when
   something is already being said. opts.game sends a Velma/Louise line to the bottom bar. */
export function say(w, text, opts = {}) {
  const toBar = w === 'n' || opts.game;
  const item = { w, text, ms: readMs(text), scene, minor: !!opts.minor };
  if (toBar) {
    if (opts.minor && (bar || barQ.length)) return;
    if (opts.front) barQ.unshift(item); else barQ.push(item);
    pumpBar(); return;
  }
  if (opts.minor && (rat || ratQ.length)) return;
  if (opts.front) ratQ.unshift(item); else ratQ.push(item);
  while (ratQ.length > MAX_RAT_QUEUE) ratQ.splice(ratQ.findIndex(q => q.minor) >= 0 ? ratQ.findIndex(q => q.minor) : 0, 1);
  if (rat && rat.minor && !item.minor) endRat(); else pumpRat();
}
const life = () => settings.talk || 1, forever = () => settings.talk === 0;

/* ---------- the bottom bar: gameplay messages, one at a time ---------- */
function pumpBar() {
  if (bar || !barQ.length) return;
  const item = barQ.shift(), b = document.createElement('div');
  b.className = 'bubble';
  b.innerHTML = `${who(item.w)}<span class="said">${item.text}</span><button class="bx" aria-label="Close">×</button><span class="life"><span></span></span>`;
  $('talk').appendChild(b);
  bar = { el: b, left: item.ms * life(), total: item.ms * life(), forever: forever() };
  const me = bar;
  b.querySelector('.bx').addEventListener('click', e => { e.stopPropagation(); sfx('tap'); endBar(me); });
  if (bar.forever) b.querySelector('.life').hidden = true;
}
function endBar(s = bar) {
  if (!s || s !== bar) return; bar = null;
  s.el.classList.add('bye'); setTimeout(() => s.el.remove(), 220);
  setTimeout(pumpBar, 260);
}

/* ---------- the rats' speech bubbles, anchored above the speaker's head ---------- */
const layer = $('ratTalk');
const rb = document.createElement('div'); rb.className = 'rb'; rb.hidden = true;
rb.innerHTML = '<span class="rb-name"></span><span class="rb-said"></span><span class="rb-tail"></span>';
layer.appendChild(rb);
rb.addEventListener('pointerdown', e => { e.stopPropagation(); if (rat) { sfx('tap'); endRat(); } });
let rbW = 0, rbH = 0;
function pumpRat() {
  if (rat || ratGap > 0 || !ratQ.length) return;
  const item = ratQ.shift();
  rat = { ...item, left: item.ms * life(), forever: forever() };
  rb.className = 'rb ' + item.w;
  rb.querySelector('.rb-name').textContent = item.w === 'v' ? 'Velma' : 'Louise';
  rb.querySelector('.rb-said').innerHTML = item.text;
  rb.hidden = false; rb.classList.remove('bye'); void rb.offsetWidth; rb.classList.add('in');
  rbW = rb.offsetWidth; rbH = rb.offsetHeight;
}
function endRat() {
  if (!rat) return; rat = null; ratGap = 280;
  rb.classList.remove('in'); rb.classList.add('bye');
}

/* Called every frame. Lines only count down while the house is visible. */
export function updateSpeech(dtMs, paused) {
  hidden = paused; layer.hidden = paused;
  if (paused) return;
  if (bar && !bar.forever) {
    bar.left -= dtMs;
    const s = bar.el.querySelector('.life span'); if (s) s.style.transform = `scaleX(${Math.max(0, bar.left / bar.total)})`;
    if (bar.left <= 0) endBar();
  }
  if (rat && !rat.forever) { rat.left -= dtMs; if (rat.left <= 0) endRat(); }
  if (!rat && ratGap > 0) { ratGap -= dtMs; if (ratGap <= 0) { ratGap = 0; rb.hidden = true; pumpRat(); } }
}

/* Called every frame after rendering: keeps the bubble above the speaker's head and on screen,
   with its tail pointing at her. While a rat talks, her name tag hides (the bubble has her name). */
const head = new THREE.Vector3();
export function placeSpeech(camera, rats) {
  const w = rat && rat.w;
  $('tagV').classList.toggle('hush', w === 'v'); $('tagL').classList.toggle('hush', w === 'l');
  if (!rat || hidden) return;
  const r = rats[w]; if (!r) return;
  r.body.localToWorld(head.set(0, 0.95, 0.55)); head.project(camera);
  const vw = window.innerWidth, vh = window.innerHeight;
  const x = (head.x * 0.5 + 0.5) * vw, y = (-head.y * 0.5 + 0.5) * vh;
  const left = Math.max(8, Math.min(vw - rbW - 8, x - rbW / 2));
  const top = Math.max(64, y - rbH - 16);
  rb.style.transform = `translate(${left}px,${top}px)`;
  rb.style.setProperty('--tail', Math.max(18, Math.min(rbW - 18, x - left)) + 'px');
}

export function clearSpeech() {
  barQ.length = 0; ratQ.length = 0; endBar();
  if (rat) endRat(); ratGap = 0; rb.hidden = true;
}
/* A new room: lines still waiting from the last room are dropped (lines already showing stay). */
export function newScene() {
  scene++;
  for (const q of [barQ, ratQ]) for (let i = q.length - 1; i >= 0; i--) if (q[i].scene !== scene) q.splice(i, 1);
}
export const speechBusy = () => (bar ? 1 : 0) + barQ.length + (rat ? 1 : 0) + ratQ.length;
