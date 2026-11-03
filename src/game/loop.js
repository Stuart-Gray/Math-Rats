/* The game loop: walking (keyboard, tap-to-walk with pathfinding, "show me the way"),
   Louise following, crumbs, puzzle rings, the mouse hole, little discoveries and the camera. */
import { THREE } from '../lib/three.js';
import { $, pick } from '../lib/util.js';
import { game, world } from './state.js';
import { W, D, scene, camera, renderer, canvas, heightAt } from '../rooms/world.js';
import { findPath } from './nav.js';
import { velma, louise } from '../rats/index.js';
import { saveRun } from '../progress/storage.js';
import { sfx } from '../audio/audio.js';
import { say, updateSpeech } from '../ui/speech.js';
import { updateHud, anyOverlay, topOverlay, hideRecipe, closeSettings, closeParent, closeJokes } from '../ui/screens.js';
import { openPuzzle, closePuzzle, puzzleOpen } from '../ui/puzzle.js';
import { drawJoke, nextRoom } from './flow.js';

const keys = new Set();
let path = [], goal = null, pointerDown = false, lastDrag = 0, stuckT = 0, nearPuzzle = null;
const actBtn = $('actBtn');

/* ---------- the "go here" marker on the floor ---------- */
const mark = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 28), new THREE.MeshBasicMaterial({ color: 0xfff4df, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
mark.rotation.x = -Math.PI / 2; mark.visible = false; scene.add(mark);

export function stopWalking() { path = []; goal = null; mark.visible = false; }
/* Walk to (x, z). opts.puzzle opens that puzzle on arrival; opts.door walks into the mouse hole. */
function walkTo(x, z, opts = {}) {
  const vp = velma.g.position;
  path = findPath(vp.x, vp.z, x, z); goal = opts; stuckT = 0;
  const end = path[path.length - 1];
  mark.position.set(end.x, heightAt(end.x, end.z) + 0.04, end.z); mark.visible = !opts.puzzle;
}
function nearestUnsolved() {
  const vp = velma.g.position; let best = null, bd = 1e9;
  for (const p of world.puzzles) if (!p.solved) { const d = Math.hypot(p.x - vp.x, p.z - vp.z); if (d < bd) { bd = d; best = p; } }
  return best;
}
/* "Show me the way": walk to the nearest puzzle, or to the open mouse hole. */
export function guide() {
  if (game.paused) return;
  const p = nearestUnsolved();
  if (p) { walkTo(p.x, p.z, { puzzle: p }); say('l', pick(['This way! Follow my whiskers.', 'I smell a puzzle over here.', 'Scurry, scurry!']), { minor: true }); }
  else if (world.door && world.door.open) walkTo(world.door.x, world.door.z, { door: true });
  sfx('tap');
}

/* ---------- input ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function floorHit(e) {
  const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  // tapping a puzzle's gem counts as tapping the puzzle
  const gems = world.puzzles.filter(p => !p.solved).map(p => p.gem);
  const g = ray.intersectObjects(gems);
  if (g.length) { const p = world.puzzles.find(q => q.gem === g[0].object); return { x: p.x, z: p.z, puzzle: p }; }
  const h = ray.intersectObject(world.floor); if (!h.length) return null;
  const pt = h[0].point;
  for (const p of world.puzzles) if (!p.solved && Math.hypot(pt.x - p.x, pt.z - p.z) < 1.7) return { x: p.x, z: p.z, puzzle: p };
  if (world.door && world.door.open && Math.hypot(pt.x - world.door.x, pt.z - (-D / 2)) < 2) return { x: world.door.x, z: world.door.z, door: true };
  return { x: pt.x, z: pt.z };
}
/* Keep Tab inside the open menu or puzzle, so keyboard players don't wander onto the game behind it. */
function trapFocus(e) {
  const id = topOverlay(); if (!id) return;
  const box = $(id), f = [...box.querySelectorAll('button, input, select, [href], [tabindex]:not([tabindex="-1"])')].filter(n => !n.disabled && n.offsetParent !== null);
  if (!f.length) return;
  const i = f.indexOf(document.activeElement);
  if (i < 0 || (e.shiftKey && i === 0) || (!e.shiftKey && i === f.length - 1)) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); }
}
export function setupInput() {
  window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.closest('#calc'))) { if (e.key !== 'Escape') return; }
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) { if (!game.paused) { keys.add(k); stopWalking(); e.preventDefault(); } }
    const onGame = e.target === canvas || e.target === document.body;
    if ((k === 'e' || ((k === ' ' || k === 'enter') && onGame)) && !game.paused && nearPuzzle) { e.preventDefault(); openPuzzle(nearPuzzle); }
    if (k === 'tab') trapFocus(e);
    if (k === 'g' && !game.paused) guide();
    if (k === 'escape') {
      const o = anyOverlay();
      if (o === 'recipe') hideRecipe(); else if (o === 'settings') closeSettings(); else if (o === 'parent') closeParent(); else if (o === 'jokebook') closeJokes(); else if (puzzleOpen()) closePuzzle();
    }
  });
  window.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointerdown', e => {
    if (game.paused) return; pointerDown = true; $('tapHint').hidden = true;
    const h = floorHit(e); if (h) walkTo(h.x, h.z, { puzzle: h.puzzle, door: h.door });
  });
  canvas.addEventListener('pointermove', e => {
    if (!pointerDown || game.paused) return; const now = performance.now(); if (now - lastDrag < 90) return; lastDrag = now;
    const h = floorHit(e); if (h && !h.puzzle) walkTo(h.x, h.z);
  });
  window.addEventListener('pointerup', () => { pointerDown = false; });
  $('guideBtn').addEventListener('click', guide);
  actBtn.addEventListener('click', () => { if (nearPuzzle) openPuzzle(nearPuzzle); });
  if (!('ontouchstart' in window)) $('tapHint').textContent = 'Arrow keys or WASD to walk · or click the floor';
}

/* ---------- loop ---------- */
const clock = new THREE.Clock(), camPos = new THREE.Vector3(), v3 = new THREE.Vector3(), look = new THREE.Vector3();
let camInit = false;
function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();
function placeTag(el, rat) {
  v3.copy(rat.g.position); v3.y += 1.35; v3.project(camera);
  if (v3.z > 1) { el.style.display = 'none'; return; } el.style.display = '';
  el.style.transform = `translate(${(v3.x * 0.5 + 0.5) * window.innerWidth}px,${(-v3.y * 0.5 + 0.5) * window.innerHeight}px) translate(-50%,-100%)`;
}
function angLerp(a, b, t) { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * t; }
function resolve(p, r) {
  p.x = Math.max(-W / 2 + 0.7, Math.min(W / 2 - 0.7, p.x)); p.z = Math.max(-D / 2 + 0.7, Math.min(D / 2 - 0.7, p.z));
  for (const c of world.cols) {
    const minX = c.x - c.w / 2, maxX = c.x + c.w / 2, minZ = c.z - c.d / 2, maxZ = c.z + c.d / 2;
    const cx = Math.max(minX, Math.min(maxX, p.x)), cz = Math.max(minZ, Math.min(maxZ, p.z));
    const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-6) { const d = Math.sqrt(d2); p.x = cx + dx / d * r; p.z = cz + dz / d * r; }
      else { const pen = [p.x - minX, maxX - p.x, p.z - minZ, maxZ - p.z]; const i = pen.indexOf(Math.min(...pen));
        if (i === 0) p.x = minX - r; else if (i === 1) p.x = maxX + r; else if (i === 2) p.z = minZ - r; else p.z = maxZ + r; }
    }
  }
}

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  const vp = velma.g.position;
  let mx = 0, mz = 0;
  if (!game.paused) {
    if (keys.has('arrowup') || keys.has('w')) mz -= 1; if (keys.has('arrowdown') || keys.has('s')) mz += 1;
    if (keys.has('arrowleft') || keys.has('a')) mx -= 1; if (keys.has('arrowright') || keys.has('d')) mx += 1;
    if (!mx && !mz && path.length) {
      const wp = path[0], dx = wp.x - vp.x, dz = wp.z - vp.z, d = Math.hypot(dx, dz);
      if (d < 0.3) { path.shift(); if (!path.length) { mark.visible = false; if (goal && goal.puzzle && !goal.puzzle.solved) openPuzzle(goal.puzzle); goal = null; } }
      else { mx = dx / d; mz = dz / d; }
    }
  }
  const len = Math.hypot(mx, mz);
  if (len > 0) {
    mx /= len; mz /= len; const sp = path.length ? 5.6 : 5.2;
    const bx = vp.x, bz = vp.z;
    vp.x += mx * sp * dt; vp.z += mz * sp * dt; resolve(vp, 0.55);
    if (path.length) {
      const moved = Math.hypot(vp.x - bx, vp.z - bz);
      stuckT = moved < sp * dt * 0.2 ? stuckT + dt : 0;
      if (stuckT > 0.4) {
        const end = path[path.length - 1], g = goal || {};
        if (g.puzzle && Math.hypot(vp.x - g.puzzle.x, vp.z - g.puzzle.z) < 2.7) { stopWalking(); openPuzzle(g.puzzle); }
        else if ((g.tries || 0) < 2) walkTo(end.x, end.z, { ...g, tries: (g.tries || 0) + 1 });
        else stopWalking();
      }
    }
    velma.heading = angLerp(velma.heading, Math.atan2(mx, mz), Math.min(1, dt * 12));
    velma.moving = Math.min(1, velma.moving + dt * 6);
  } else velma.moving = Math.max(0, velma.moving - dt * 5);
  velma.g.rotation.y = velma.heading;
  vp.y += (heightAt(vp.x, vp.z) - vp.y) * Math.min(1, dt * 14);

  // Louise trots at Velma's side
  const h = velma.heading, lp = louise.g.position;
  const tx = vp.x + Math.cos(h) * 1.15 - Math.sin(h) * 0.15, tz = vp.z - Math.sin(h) * 1.15 - Math.cos(h) * 0.15;
  const ox = lp.x, oz = lp.z;
  if (Math.hypot(tx - lp.x, tz - lp.z) > 5) { lp.x = tx; lp.z = tz; }
  lp.x += (tx - lp.x) * Math.min(1, dt * 7); lp.z += (tz - lp.z) * Math.min(1, dt * 7); resolve(lp, 0.5);
  lp.y += (heightAt(lp.x, lp.z) - lp.y) * Math.min(1, dt * 14);
  const lmove = Math.hypot(lp.x - ox, lp.z - oz) / Math.max(dt, 1e-4);
  louise.moving = lmove > 0.5 ? Math.min(1, louise.moving + dt * 6) : Math.max(0, louise.moving - dt * 5);
  louise.heading = angLerp(louise.heading, lmove > 0.5 ? Math.atan2(lp.x - ox, lp.z - oz) : velma.heading, Math.min(1, dt * 8));
  louise.g.rotation.y = louise.heading;
  [velma, louise].forEach((r, i) => {
    r.body.position.y = Math.abs(Math.sin(t * 16 + i)) * 0.06 * r.moving + Math.sin(t * 2 + i) * 0.01;
    r.body.rotation.x = Math.sin(t * 16 + i) * 0.04 * r.moving;
    r.tail.rotation.y = Math.sin(t * (r.moving > 0.2 ? 11 : 2.5) + i) * 0.35;
  });

  // cheese crumbs reveal jokes
  for (const c of world.crumbs) {
    if (c.taken) continue;
    c.m.rotation.y += dt * 2; c.m.position.y = c.y + Math.sin(t * 3 + c.x) * 0.08;
    if (!game.paused && Math.hypot(vp.x - c.x, vp.z - c.z) < 1.1) { c.taken = true; c.m.visible = false; game.cheese++; sfx('crumb'); updateHud(); const j = drawJoke(); say(j[0], j[1]); saveRun(game); }
  }
  // puzzle rings
  nearPuzzle = null; let best = 2.7;
  for (const p of world.puzzles) {
    if (!p.solved) { const s = 1 + Math.sin(t * 3) * 0.07; p.ring.scale.set(s, s, s); p.ring.material.opacity = 0.65 + Math.sin(t * 3) * 0.25; p.gem.rotation.y += dt * 1.6; p.gem.position.y = p.gemY - 0.2 + Math.sin(t * 2 + p.x) * (p.gemY < 2 ? 0.1 : 0.25); }
    const d = Math.hypot(vp.x - p.x, vp.z - p.z); if (!p.solved && d < best) { best = d; nearPuzzle = p; }
  }
  if (!game.paused && nearPuzzle) { if (actBtn.hidden || actBtn.dataset.id !== nearPuzzle.def.id) { actBtn.dataset.id = nearPuzzle.def.id; actBtn.innerHTML = `Investigate: ${nearPuzzle.def.name}<small>tap here, or press E</small>`; } actBtn.hidden = false; }
  else actBtn.hidden = true;
  // mouse hole
  const door = world.door;
  if (door) {
    const target = door.open ? 1 : 0; door.glow.material.opacity += (target * (0.75 + Math.sin(t * 4) * 0.25) - door.glow.material.opacity) * Math.min(1, dt * 4);
    door.light.intensity = door.glow.material.opacity * 1.6;
    if (door.open && !game.paused && Math.hypot(vp.x - door.x, vp.z - door.z) < 1.3) { stopWalking(); nextRoom(); }
  }
  $('guideBtn').classList.toggle('glow', !!(door && door.open));
  // the cat snores
  world.catZs.forEach(z => { const k = (t * 0.45 + z.phase) % 1; z.s.position.set(z.x + k * 0.8, 1.3 + k * 1.6, z.z); z.s.material.opacity = Math.sin(k * Math.PI); const sc = 0.3 + k * 0.4; z.s.scale.set(sc, sc, sc); });
  // room animations, see-through furniture, toilet zoomies
  world.anim.forEach(f => f(t, dt, vp));
  for (const f of world.fades) {
    const inside = vp.x > f.x0 && vp.x < f.x1 && vp.z > f.z0 && vp.z < f.z1, to = inside ? 0.28 : 1;
    f.meshes.forEach(m => { const mm = m.material; mm.opacity += (to - mm.opacity) * Math.min(1, dt * 6); mm.transparent = mm.opacity < 0.99; mm.depthWrite = !mm.transparent; });
  }
  const lap = world.lap;
  if (lap && !lap.done && !game.paused) {
    if (Math.hypot(vp.x - lap.x, vp.z - lap.z) < lap.r) {
      const a = Math.atan2(vp.z - lap.z, vp.x - lap.x);
      if (lap.last != null) { let d = a - lap.last; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; lap.sum += d; }
      lap.last = a;
      if (Math.abs(lap.sum) >= Math.PI * 2) { lap.done = true; game.cheese += 3; updateHud(); saveRun(game); sfx('zoom'); say('v', 'ZOOMIES! A whole lap around the toilet! That is worth 3 bonus cheese.'); say('l', 'Rats do zoomies when we are extra happy. It is science.'); }
    } else { lap.sum = 0; lap.last = null; }
  }
  mark.material.opacity = 0.55 + Math.sin(t * 6) * 0.25;
  updateSpeech(dt * 1000, game.paused);

  // camera
  const portrait = camera.aspect < 0.8;
  const off = portrait ? [5, 15, 14] : [6.5, 11.5, 12.5];
  look.set(vp.x * 0.85, 0.5, vp.z * 0.8 + (portrait ? -1 : 0));
  camPos.set(look.x + off[0], off[1], look.z + off[2]);
  if (!camInit) { camera.position.copy(camPos); camInit = true; } else camera.position.lerp(camPos, Math.min(1, dt * 3));
  camera.lookAt(look);
  renderer.render(scene, camera);
  placeTag($('tagV'), velma); placeTag($('tagL'), louise);
  requestAnimationFrame(tick);
}
export function startLoop() { requestAnimationFrame(tick); }
