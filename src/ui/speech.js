/* Speech bubbles. Up to two show at once; extra lines wait in a queue instead of knocking
   earlier ones off screen. Each bubble stays long enough to read (based on its length and the
   "speech bubbles stay" setting), pauses while a puzzle or menu is open, and has an X to close it. */
import { $ } from '../lib/util.js';
import { settings } from '../progress/storage.js';
import { sfx } from '../audio/audio.js';

const MAX_VISIBLE = 2;
const queue = [], shown = [];

export function who(w) {
  return w === 'v' ? '<span class="who v">Velma</span>' : w === 'l' ? '<span class="who l">Louise</span>' : '<span class="who n">Psst</span>';
}
/* Reading time: about 0.4 s per word on top of 3 s, never less than 5 s. */
function readMs(text) {
  const words = text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(5000, 3000 + words * 400);
}

/* opts.front puts the line at the front of the queue (room intros).
   opts.minor lines (little chatter) are skipped if other lines are already waiting. */
let scene = 0;
export function say(w, text, opts = {}) {
  if (opts.minor && (queue.length || shown.length >= MAX_VISIBLE)) return;
  const item = { w, text, ms: readMs(text), scene };
  if (opts.front) queue.unshift(item); else queue.push(item);
  pump();
}
function pump() {
  while (shown.length < MAX_VISIBLE && queue.length) show(queue.shift());
}
function show(item) {
  const t = $('talk'), b = document.createElement('div');
  b.className = 'bubble';
  b.innerHTML = `${who(item.w)}<span class="said">${item.text}</span><button class="bx" aria-label="Close">×</button><span class="life"><span></span></span>`;
  t.appendChild(b);
  const s = { el: b, left: item.ms * (settings.talk || 1), total: item.ms * (settings.talk || 1), forever: settings.talk === 0 };
  shown.push(s);
  b.querySelector('.bx').addEventListener('click', e => { e.stopPropagation(); sfx('tap'); remove(s); });
  if (s.forever) b.querySelector('.life').hidden = true;
}
function remove(s) {
  const i = shown.indexOf(s); if (i < 0) return; shown.splice(i, 1);
  s.el.classList.add('bye'); setTimeout(() => s.el.remove(), 220);
  pump();
}
/* Called every frame. Bubbles only count down while the house is visible. */
export function updateSpeech(dtMs, paused) {
  if (paused) return;
  for (const s of shown.slice()) {
    if (s.forever) continue;
    s.left -= dtMs;
    const bar = s.el.querySelector('.life span'); if (bar) bar.style.transform = `scaleX(${Math.max(0, s.left / s.total)})`;
    if (s.left <= 0) remove(s);
  }
}
export function clearSpeech() { queue.length = 0; shown.slice().forEach(remove); }
/* A new room: lines still waiting from the last room are dropped (bubbles already showing stay). */
export function newScene() { scene++; for (let i = queue.length - 1; i >= 0; i--) if (queue[i].scene !== scene) queue.splice(i, 1); }
export const speechBusy = () => shown.length + queue.length;
