/* Wall art and little moving props: rat-and-maths artworks in every room.
   Everything here hangs on the two back walls (or sits flat on the floor), so nothing blocks
   the rats' paths, the puzzle rings or the crumbs. Each picture is one small canvas texture. */
import { THREE } from '../lib/three.js';
import { world } from '../game/state.js';
import { room, mesh, mat, W, D } from './world.js';

/* ---------- drawing helpers (2D canvas) ---------- */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
function text(g, str, x, y, size, color, { font = 'Georgia, serif', weight = '700', align = 'center' } = {}) {
  g.font = `${weight} ${size}px ${font}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(str, x, y);
}
function ell(g, x, y, rx, ry, color) { g.fillStyle = color; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
/* A cartoon rat portrait, head and shoulders, centred on (x, y) with size s. */
function ratPortrait(g, x, y, s, { fur = '#4a3026', belly = null, stripe = false, robe = null, bow = null, specs = false } = {}) {
  // shoulders / robe
  g.fillStyle = robe || fur; g.beginPath(); g.ellipse(x, y + s * 1.25, s * 1.15, s * 0.8, 0, Math.PI, 0); g.fill();
  if (belly) ell(g, x, y + s * 1.05, s * 0.5, s * 0.45, belly);
  if (stripe) { g.fillStyle = '#f3ece4'; g.fillRect(x - s * 0.06, y + s * 0.62, s * 0.12, s * 0.4); }
  // ears
  [-1, 1].forEach(k => { ell(g, x + k * s * 0.55, y - s * 0.5, s * 0.36, s * 0.4, '#d8a39b'); ell(g, x + k * s * 0.55, y - s * 0.48, s * 0.24, s * 0.28, '#c47f7b'); });
  // head and muzzle
  ell(g, x, y, s * 0.62, s * 0.66, fur);
  ell(g, x, y + s * 0.34, s * 0.32, s * 0.26, '#9a7563');
  ell(g, x, y + s * 0.24, s * 0.09, s * 0.07, '#e39aa0');
  // eyes
  [-1, 1].forEach(k => { ell(g, x + k * s * 0.24, y - s * 0.06, s * 0.1, s * 0.11, '#0b0607'); ell(g, x + k * s * 0.24 + s * 0.03, y - s * 0.1, s * 0.03, s * 0.03, '#fff'); });
  if (specs) { g.strokeStyle = '#d8b24a'; g.lineWidth = s * 0.04; [-1, 1].forEach(k => { g.beginPath(); g.arc(x + k * s * 0.24, y - s * 0.06, s * 0.16, 0, 7); g.stroke(); }); g.beginPath(); g.moveTo(x - s * 0.08, y - s * 0.08); g.lineTo(x + s * 0.08, y - s * 0.08); g.stroke(); }
  // whiskers
  g.strokeStyle = 'rgba(255,248,240,.85)'; g.lineWidth = Math.max(1, s * 0.015);
  [-1, 1].forEach(k => { for (let j = -1; j <= 1; j++) { g.beginPath(); g.moveTo(x + k * s * 0.15, y + s * 0.3); g.quadraticCurveTo(x + k * s * 0.6, y + s * (0.25 + j * 0.1), x + k * s * 0.95, y + s * (0.3 + j * 0.16)); g.stroke(); } });
  if (bow) { g.fillStyle = bow; g.beginPath(); g.moveTo(x + s * 0.35, y - s * 0.62); g.lineTo(x + s * 0.7, y - s * 0.8); g.lineTo(x + s * 0.7, y - s * 0.44); g.closePath(); g.moveTo(x + s * 0.35, y - s * 0.62); g.lineTo(x + s * 0.02, y - s * 0.84); g.lineTo(x + s * 0.06, y - s * 0.44); g.closePath(); g.fill(); ell(g, x + s * 0.36, y - s * 0.62, s * 0.08, s * 0.08, bow); }
}
function caption(g, w, h, str, bg = '#f6ead2', fg = '#3a2438') {
  g.fillStyle = bg; g.fillRect(0, h - 64, w, 64);
  let size = 34; g.font = `700 ${size}px Georgia, serif`; while (size > 18 && g.measureText(str).width > w - 24) { size -= 2; g.font = `700 ${size}px Georgia, serif`; }
  text(g, str, w / 2, h - 32, size, fg);
}

/* ---------- hanging things on the walls ---------- */
/* A framed picture on the back wall (wall 'back', at x) or the left wall (wall 'left', at z). */
export function picture({ wall = 'back', at, y, w, h, px = 512, draw, frame = 0x6b4a33, frameW = 0.14, glow = 0.25 }) {
  const g = new THREE.Group();
  const fr = mesh(new THREE.BoxGeometry(w + frameW * 2, h + frameW * 2, 0.08), mat(frame, { roughness: 0.6 }), { cast: false }); g.add(fr);
  const map = canvasTex(px, Math.round(px * h / w), draw);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, roughness: 0.9, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: glow }));
  pic.position.z = 0.045; g.add(pic);
  hang(g, wall, at, y); return g;
}
function hang(g, wall, at, y) {
  if (wall === 'back') g.position.set(at, y, -D / 2 + 0.06);
  else { g.position.set(-W / 2 + 0.06, y, at); g.rotation.y = Math.PI / 2; }
  room.add(g);
}

/* A wall clock showing the real time, with a swinging pendulum. The face is a maths clock:
   every number is a little sum. */
export function clock({ wall = 'back', at, y, r = 0.85, wood = 0x7a4a2a }) {
  const g = new THREE.Group();
  const labels = ['3×4', '1²', '√4', '6÷2', '2²', '10−5', '3!', '7', '2³', '3²', '5+5', '11'];
  const map = canvasTex(512, 512, (c, s) => {
    ell(c, s / 2, s / 2, s / 2, s / 2, '#fbf3e0');
    labels.forEach((l, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2; text(c, l, s / 2 + Math.cos(a) * s * 0.38, s / 2 + Math.sin(a) * s * 0.38, l.length > 3 ? 38 : 46, '#3a2438'); });
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; c.strokeStyle = '#8a6a5a'; c.lineWidth = i % 5 ? 2 : 5;
      c.beginPath(); c.moveTo(s / 2 + Math.cos(a) * s * 0.47, s / 2 + Math.sin(a) * s * 0.47); c.lineTo(s / 2 + Math.cos(a) * s * (i % 5 ? 0.45 : 0.43), s / 2 + Math.sin(a) * s * (i % 5 ? 0.45 : 0.43)); c.stroke(); }
    text(c, 'TICK-TOCK, IT’S SNACK O’CLOCK', s / 2, s * 0.68, 20, '#a0603a', { font: 'sans-serif', weight: '900' });
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshStandardMaterial({ map, roughness: 0.7, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.2 }));
  face.position.z = 0.09; g.add(face);
  const rim = mesh(new THREE.TorusGeometry(r, 0.09, 8, 40), mat(wood, { roughness: 0.5 }), { cast: false }); rim.position.z = 0.08; g.add(rim);
  const back = mesh(new THREE.CylinderGeometry(r, r, 0.08, 40), mat(wood), { cast: false }); back.rotation.x = Math.PI / 2; back.position.z = 0.04; g.add(back);
  // case for the pendulum, open at the front
  const caseM = mat(wood, { roughness: 0.6 });
  const caseB = mesh(new THREE.BoxGeometry(r * 1.1, r * 1.9, 0.06), mat(0x4a2e1c), { cast: false }); caseB.position.set(0, -r * 1.75, 0.03); g.add(caseB);
  [-1, 1].forEach(k => { const side = mesh(new THREE.BoxGeometry(0.08, r * 1.9, 0.2), caseM, { cast: false }); side.position.set(k * r * 0.55, -r * 1.75, 0.1); g.add(side); });
  const foot = mesh(new THREE.BoxGeometry(r * 1.2, 0.1, 0.22), caseM, { cast: false }); foot.position.set(0, -r * 2.7, 0.1); g.add(foot);
  const pend = new THREE.Group(); pend.position.set(0, -r * 0.85, 0.12); g.add(pend);
  const gold = mat(0xd8b24a, { metalness: 0.7, roughness: 0.3 });
  const rod = mesh(new THREE.BoxGeometry(0.04, r * 1.4, 0.02), gold, { cast: false }); rod.position.y = -r * 0.7; pend.add(rod);
  // the bob is a little golden cheese wheel
  const bob = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 20), mat(0xf2c14e, { metalness: 0.4, roughness: 0.35 }), { cast: false }); bob.rotation.x = Math.PI / 2; bob.position.y = -r * 1.45; pend.add(bob);
  // hands
  const hand = (len, wd, col, z) => { const p = new THREE.Group(); const m = mesh(new THREE.BoxGeometry(wd, len, 0.02), mat(col), { cast: false }); m.position.y = len / 2 - 0.06; p.add(m); p.position.z = z; g.add(p); return p; };
  const hr = hand(r * 0.5, 0.07, 0x3a2438, 0.11), mn = hand(r * 0.78, 0.045, 0x3a2438, 0.12), sc = hand(r * 0.85, 0.02, 0xd9536f, 0.13);
  const pin = mesh(new THREE.SphereGeometry(0.05, 8, 6), gold, { cast: false }); pin.position.z = 0.14; g.add(pin);
  hang(g, wall, at, y);
  world.anim.push(t => {
    pend.rotation.z = Math.sin(t * Math.PI) * 0.22;                 // one swing a second: tick, tock
    const d = new Date(), sec = d.getSeconds(), min = d.getMinutes() + sec / 60, h = (d.getHours() % 12) + min / 60;
    sc.rotation.z = -sec / 60 * Math.PI * 2; mn.rotation.z = -min / 60 * Math.PI * 2; hr.rotation.z = -h / 12 * Math.PI * 2;
  });
}

/* A round floor rug from a canvas pattern (flat, so the rats walk right over it). */
export function rug(x, z, r, sx, sz, draw) {
  const map = canvasTex(256, 256, draw);
  const m = mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshStandardMaterial({ map, roughness: 1 }), { cast: false });
  m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(x, 0.012, z); room.add(m); return m;
}

/* ---------- each room's decor ---------- */
export function kitchenDecor() {
  // the Mona Lisa-Rat, above the counter
  picture({ at: 1.6, y: 5.0, w: 1.9, h: 2.4, frame: 0xb8862e, draw: (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#8fa37a'); sky.addColorStop(0.5, '#a89a68'); sky.addColorStop(1, '#5a4a32'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(70,90,70,.6)'; g.beginPath(); g.moveTo(0, h * 0.45); g.quadraticCurveTo(w * 0.3, h * 0.3, w * 0.5, h * 0.42); g.quadraticCurveTo(w * 0.8, h * 0.5, w, h * 0.38); g.lineTo(w, h * 0.6); g.lineTo(0, h * 0.6); g.fill();
    ratPortrait(g, w / 2, h * 0.42, w * 0.3, { fur: '#4a3026', robe: '#2e2a1e' });
    g.strokeStyle = '#3a1e1a'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h * 0.42 + w * 0.07, w * 0.08, 0.2, Math.PI - 0.2); g.stroke(); // the mysterious smile
    caption(g, w, h, 'The Mona Lisa-Rat');
  } });
  // poster: keep calm
  picture({ at: 5.4, y: 4.9, w: 1.8, h: 2.3, frame: 0xf3ede2, frameW: 0.06, glow: 0.3, draw: (g, w, h) => {
    g.fillStyle = '#c8414f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd34d'; g.beginPath(); g.moveTo(w * 0.35, h * 0.2); g.lineTo(w * 0.68, h * 0.12); g.lineTo(w * 0.68, h * 0.2); g.closePath(); g.fill(); // cheese crown
    ['KEEP', 'CALM', 'AND', 'SOLVE', 'FOR x'].forEach((l, i) => text(g, l, w / 2, h * (0.32 + i * 0.13), l.length > 3 ? 84 : 52, '#fff4df', { font: 'sans-serif', weight: '900' }));
  } });
  // the maths clock above the mouse hole
  clock({ at: -4.5, y: 5.1 });
  // left wall: apple π recipe card and a cheese calendar
  picture({ wall: 'left', at: -1.8, y: 3.5, w: 2.0, h: 1.5, frame: 0x9c6a3c, frameW: 0.08, draw: (g, w, h) => {
    g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.fillStyle = '#e9a0a8'; for (let y = 70; y < h; y += 44) g.fillRect(20, y, w - 40, 2);
    text(g, 'Recipe: Apple π', w / 2, 40, 46, '#c8414f');
    ['3.14 apples', '1 crust, round (obviously)', 'Bake for 2πr minutes', 'Serves: 2 rats, no leftovers'].forEach((l, i) => text(g, l, 30, 102 + i * 44, 30, '#3a2438', { align: 'left', weight: '400' }));
  } });
  picture({ wall: 'left', at: 2.4, y: 3.4, w: 1.7, h: 2.1, frame: 0xf3ede2, frameW: 0.05, draw: (g, w, h) => {
    g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.fillStyle = '#5f9272'; g.fillRect(0, 0, w, 90);
    text(g, 'CHEESE-UARY', w / 2, 46, 52, '#fff', { font: 'sans-serif', weight: '900' });
    const cw = w / 7; for (let d = 0; d < 28; d++) { const cx = (d % 7) * cw + cw / 2, cy = 130 + Math.floor(d / 7) * cw * 1.05; text(g, String(d + 1), cx, cy, 28, '#3a2438', { font: 'sans-serif', weight: '400' }); if (d === 13) { g.strokeStyle = '#c8414f'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 26, 0, 7); g.stroke(); } }
    text(g, '14th: Brie Day!', w / 2, h - 34, 34, '#c8414f');
  } });
}

export function livingRoomDecor() {
  // The Starry Cheese, above the sofa
  picture({ at: 2.5, y: 4.4, w: 3.8, h: 2.5, frame: 0xb8862e, draw: (g, w, h) => {
    g.fillStyle = '#1f3a6e'; g.fillRect(0, 0, w, h);
    g.lineWidth = 10; for (let i = 0; i < 26; i++) { g.strokeStyle = ['#3d6cb0', '#7fa6d8', '#2a4f8e', '#bcd4f0'][i % 4]; g.beginPath(); g.arc(w * (0.1 + (i * 0.37) % 0.9), h * (0.15 + (i * 0.23) % 0.55), 20 + (i * 13) % 60, i, i + 2.2); g.stroke(); }
    for (let i = 0; i < 9; i++) { const x = w * (0.08 + (i * 0.41) % 0.86), y = h * (0.08 + (i * 0.29) % 0.5); ell(g, x, y, 16, 16, 'rgba(255,224,120,.35)'); ell(g, x, y, 7, 7, '#ffe17a'); }
    // the moon is a cheese wedge
    g.fillStyle = '#ffd34d'; g.beginPath(); g.moveTo(w * 0.72, h * 0.12); g.lineTo(w * 0.92, h * 0.22); g.lineTo(w * 0.72, h * 0.34); g.closePath(); g.fill();
    [[0.77, 0.2], [0.8, 0.27], [0.75, 0.26]].forEach(([a, b]) => ell(g, w * a, h * b, 7, 6, '#e0a92a'));
    g.fillStyle = '#2b3a22'; g.fillRect(0, h * 0.68, w, h); g.fillStyle = '#1a2414'; g.beginPath(); g.moveTo(w * 0.12, h); g.quadraticCurveTo(w * 0.06, h * 0.4, w * 0.15, h * 0.12); g.quadraticCurveTo(w * 0.22, h * 0.5, w * 0.2, h); g.fill();
    caption(g, w, h, 'The Starry Cheese, by Vincent van Gnaw');
  } });
  // the sisters' portrait above the piano
  picture({ at: 8, y: 4.6, w: 2.4, h: 1.85, frame: 0x3a2a22, draw: (g, w, h) => {
    const bg = g.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h * 0.4, w * 0.6); bg.addColorStop(0, '#f6d7c3'); bg.addColorStop(1, '#c98f7a'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    ratPortrait(g, w * 0.32, h * 0.42, w * 0.15, { fur: '#3d271f', stripe: true });
    ratPortrait(g, w * 0.68, h * 0.44, w * 0.15, { fur: '#56392d', belly: '#f3ece4', bow: '#d9536f' });
    ell(g, w / 2, h * 0.2, 14, 12, '#d9536f');
    caption(g, w, h, 'Velma & Louise, best sisters');
  } });
  // Sir Whiskerton, employee of the month (for napping)
  picture({ wall: 'left', at: 5.2, y: 3.4, w: 2.0, h: 2.4, frame: 0xd8b24a, frameW: 0.1, draw: (g, w, h) => {
    g.fillStyle = '#fbf3e0'; g.fillRect(0, 0, w, h);
    text(g, 'EMPLOYEE', w / 2, 46, 52, '#3a2438', { font: 'sans-serif', weight: '900' }); text(g, 'OF THE MONTH', w / 2, 96, 36, '#3a2438', { font: 'sans-serif', weight: '700' });
    // a sleeping orange cat
    ell(g, w / 2, h * 0.55, w * 0.32, h * 0.16, '#e09a4a'); ell(g, w * 0.32, h * 0.47, w * 0.15, w * 0.13, '#e09a4a');
    g.fillStyle = '#e09a4a'; [[0.22, 0.38], [0.38, 0.38]].forEach(([a, b]) => { g.beginPath(); g.moveTo(w * a, h * (b + 0.04)); g.lineTo(w * (a + 0.03), h * (b - 0.04)); g.lineTo(w * (a + 0.07), h * (b + 0.04)); g.fill(); });
    g.strokeStyle = '#3a2438'; g.lineWidth = 4; [0.27, 0.36].forEach(a => { g.beginPath(); g.arc(w * a, h * 0.47, 9, 0.2, Math.PI - 0.2); g.stroke(); });
    text(g, 'z z z', w * 0.62, h * 0.32, 40, '#7fa6d8', { font: 'sans-serif' });
    text(g, 'Sir Whiskerton', w / 2, h * 0.78, 40, '#c8414f'); text(g, 'for 400 hours of napping', w / 2, h * 0.88, 28, '#3a2438', { weight: '400' });
  } });
  // a pie chart (it really is a pie)
  picture({ wall: 'left', at: 1.4, y: 3.5, w: 2.0, h: 2.0, frame: 0x6b4a33, frameW: 0.08, draw: (g, w, h) => {
    g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); text(g, 'What rats think about', w / 2, 40, 36, '#3a2438');
    const parts = [[0.5, '#f2c14e', 'Cheese'], [0.25, '#d9536f', 'Snacks'], [0.15, '#7fa6d8', 'Naps'], [0.1, '#5f9272', 'Algebra']];
    let a = -Math.PI / 2; const cx = w * 0.34, cy = h * 0.58, r = w * 0.26;
    parts.forEach(([f, c, l], i) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a, a + f * Math.PI * 2); g.closePath(); g.fill(); a += f * Math.PI * 2;
      g.fillRect(w * 0.66, h * (0.38 + i * 0.12), 26, 26); text(g, `${l} ${Math.round(f * 100)}%`, w * 0.66 + 34, h * (0.38 + i * 0.12) + 13, 26, '#3a2438', { align: 'left', weight: '400', font: 'sans-serif' }); });
    text(g, 'pie chart (with real crust)', w / 2, h - 28, 26, '#8a6a5a', { weight: '400' });
  } });
  // a goldfish bowl on top of the bookshelf, fish going round and round
  const bowlM = new THREE.MeshStandardMaterial({ color: 0xcfe8f2, transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false });
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), bowlM); bowl.position.set(-10.2, 6.5, -1.0); room.add(bowl);
  const water = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 12, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), new THREE.MeshStandardMaterial({ color: 0x7fc4e8, transparent: true, opacity: 0.4, depthWrite: false })); water.position.copy(bowl.position); room.add(water);
  const fish = new THREE.Group(); const fm = mat(0xf08a24, { roughness: 0.4, emissive: 0x4a1a00 });
  const fb = mesh(new THREE.SphereGeometry(0.12, 10, 8), fm, { cast: false }); fb.scale.set(1.5, 1, 0.7); fish.add(fb);
  const ft = mesh(new THREE.ConeGeometry(0.09, 0.14, 6), fm, { cast: false }); ft.rotation.z = Math.PI / 2; ft.position.x = -0.22; fish.add(ft);
  room.add(fish);
  world.anim.push(t => { const a = t * 0.9; fish.position.set(-10.2 + Math.cos(a) * 0.25, 6.4 + Math.sin(t * 1.7) * 0.05, -1.0 + Math.sin(a) * 0.25); fish.rotation.y = -a - Math.PI / 2; ft.rotation.y = Math.sin(t * 12) * 0.5; });
  // the old maths clock lives here too, on the back wall by the lamp
  clock({ at: -7.3, y: 4.9, r: 0.7, wood: 0x5a3a24 });
}

export function bathroomDecor() {
  // The Great Wave off Ka-nibble, above the tub
  picture({ at: 7.0, y: 4.0, w: 3.4, h: 2.3, frame: 0xffffff, frameW: 0.1, glow: 0.3, draw: (g, w, h) => {
    g.fillStyle = '#f3e6c8'; g.fillRect(0, 0, w, h);
    ell(g, w * 0.78, h * 0.25, 40, 40, '#e8b0a0');
    g.fillStyle = '#2b4f7e'; g.beginPath(); g.moveTo(0, h * 0.85); g.quadraticCurveTo(w * 0.1, h * 0.2, w * 0.42, h * 0.18); g.quadraticCurveTo(w * 0.5, h * 0.2, w * 0.46, h * 0.32); g.quadraticCurveTo(w * 0.36, h * 0.3, w * 0.36, h * 0.45); g.quadraticCurveTo(w * 0.5, h * 0.8, w, h * 0.7); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 8; i++) ell(g, w * (0.2 + i * 0.03), h * (0.2 + Math.sin(i) * 0.03), 10, 8, '#fff');
    // a rubber duck surfing the wave, with a tiny rat on top
    const dx = w * 0.62, dy = h * 0.62; ell(g, dx, dy, 44, 28, '#ffd23f'); ell(g, dx + 34, dy - 30, 22, 20, '#ffd23f'); g.fillStyle = '#f08a24'; g.beginPath(); g.moveTo(dx + 52, dy - 32); g.lineTo(dx + 72, dy - 26); g.lineTo(dx + 52, dy - 22); g.fill();
    ratPortrait(g, dx - 6, dy - 52, 22, { fur: '#4a3026' });
    caption(g, w, h, 'The Great Wave off Ka-nibble', '#2b4f7e', '#fff4df');
  } });
  // the paw-washing sign above the mouse hole
  picture({ at: 0.8, y: 3.2, w: 2.0, h: 1.3, frame: 0x6f9fb1, frameW: 0.06, glow: 0.3, draw: (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    text(g, 'WASH YOUR PAWS', w / 2, h * 0.24, 56, '#2b6f8e', { font: 'sans-serif', weight: '900' });
    text(g, '20 seconds = 4 × 5', w / 2, h * 0.52, 44, '#3a2438'); text(g, '(or sing the cheese song twice)', w / 2, h * 0.78, 30, '#6a5a6a', { weight: '400' });
  } });
  // left wall, by the toilet: the toilet paper fractions chart
  picture({ wall: 'left', at: 6.4, y: 3.6, w: 1.8, h: 1.8, frame: 0xf2b8c6, frameW: 0.08, draw: (g, w, h) => {
    g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); text(g, 'Toilet paper', w / 2, 40, 40, '#3a2438'); text(g, 'fractions', w / 2, 82, 40, '#3a2438');
    [[1, 'full'], [0.5, '½'], [0.25, '¼'], [0, '0 = PANIC']].forEach(([f, l], i) => { const x = w * (0.14 + i * 0.24), y = h * 0.6;
      ell(g, x, y, 34, 50, '#e9e2d6'); g.fillStyle = '#ffffff'; g.fillRect(x - 34, y - 50 + 100 * (1 - f), 68, 100 * f); ell(g, x, y - 50, 34, 10, '#c9bfae'); ell(g, x, y - 50, 12, 6, '#8a7a6a');
      text(g, l, x, h * 0.88, i === 3 ? 22 : 34, i === 3 ? '#c8414f' : '#3a2438', { font: 'sans-serif' }); });
  } });
}

export function atticDecor() {
  // Great-Great-Grandrat Algebrina, above the trunk
  picture({ at: -6, y: 4.0, w: 1.9, h: 2.4, frame: 0xa8822e, frameW: 0.16, glow: 0.4, draw: (g, w, h) => {
    g.fillStyle = '#2a1e1a'; g.fillRect(0, 0, w, h);
    const v = g.createRadialGradient(w / 2, h * 0.42, 20, w / 2, h * 0.42, w * 0.55); v.addColorStop(0, '#8a6a4a'); v.addColorStop(1, '#2a1e1a'); g.fillStyle = v; g.beginPath(); g.ellipse(w / 2, h * 0.43, w * 0.44, h * 0.38, 0, 0, 7); g.fill();
    ratPortrait(g, w / 2, h * 0.4, w * 0.24, { fur: '#5a4030', robe: '#4a2a4a', specs: true });
    ell(g, w / 2, h * 0.58, 16, 10, '#f3ece4');
    caption(g, w, h, 'Great-Great-Grandrat Algebrina', '#2a1e1a', '#e8d4a0');
  } });
  // a chalkboard treasure map leaning on the left wall
  picture({ wall: 'left', at: -1.5, y: 3.0, w: 3.0, h: 2.0, frame: 0x8a6a4a, frameW: 0.12, glow: 0.35, draw: (g, w, h) => {
    g.fillStyle = '#2f4a3a'; g.fillRect(0, 0, w, h);
    const chalk = 'rgba(245,240,225,.9)'; g.strokeStyle = chalk; g.lineWidth = 5; g.setLineDash([14, 12]);
    g.beginPath(); g.moveTo(w * 0.1, h * 0.8); g.bezierCurveTo(w * 0.3, h * 0.4, w * 0.5, h * 0.9, w * 0.78, h * 0.42); g.stroke(); g.setLineDash([]);
    g.strokeStyle = '#ff8a8a'; g.lineWidth = 9; g.beginPath(); g.moveTo(w * 0.74, h * 0.36); g.lineTo(w * 0.84, h * 0.5); g.moveTo(w * 0.84, h * 0.36); g.lineTo(w * 0.74, h * 0.5); g.stroke();
    text(g, 'x marks the spot!', w / 2, h * 0.14, 46, chalk, { font: 'sans-serif' });
    text(g, '2x + 1 = 7', w * 0.3, h * 0.36, 40, chalk, { font: 'sans-serif' }); text(g, 'x = 3 paces', w * 0.3, h * 0.5, 34, chalk, { font: 'sans-serif', weight: '400' });
    text(g, 'SNACKS →', w * 0.78, h * 0.62, 32, '#ffe08a', { font: 'sans-serif' });
  } });
  // a braided rug in the middle of the floor
  rug(-1.5, 3.2, 2.6, 1.3, 0.8, (g, s) => { const c = ['#9a5a4a', '#c99a5a', '#6a7a5a', '#b07a6a', '#d8c08a']; for (let i = 14; i > 0; i--) ell(g, s / 2, s / 2, s / 2 * i / 14, s / 2 * i / 14, c[i % 5]); });
  // a cobweb in the corner, and a little spider bobbing on its thread
  const webPts = [], cx = -W / 2 + 0.1, cy = 8.6, cz = -D / 2 + 0.1;
  for (let k = 0; k < 6; k++) { const a = k / 5 * Math.PI / 2; webPts.push(new THREE.Vector3(cx, cy, cz), new THREE.Vector3(cx + Math.cos(a) * 2.2, cy - Math.sin(a) * 2.2, cz)); }
  for (let ring = 1; ring <= 4; ring++) for (let k = 0; k < 5; k++) { const a0 = k / 5 * Math.PI / 2, a1 = (k + 1) / 5 * Math.PI / 2, rr = ring * 0.5;
    webPts.push(new THREE.Vector3(cx + Math.cos(a0) * rr, cy - Math.sin(a0) * rr, cz), new THREE.Vector3(cx + Math.cos(a1) * rr * 0.96, cy - Math.sin(a1) * rr * 0.96, cz)); }
  const webM = new THREE.LineBasicMaterial({ color: 0xe8e4dc, transparent: true, opacity: 0.55 });
  const web = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(webPts), webM); web.position.z = 0.02; room.add(web);
  const spider = new THREE.Group(); const sm = mat(0x1a1418, { roughness: 0.5 });
  spider.add(mesh(new THREE.SphereGeometry(0.13, 10, 8), sm, { cast: false }));
  const sh = mesh(new THREE.SphereGeometry(0.08, 8, 6), sm, { cast: false }); sh.position.y = 0.14; spider.add(sh);
  for (let k = 0; k < 4; k++) [-1, 1].forEach(s => { const l = mesh(new THREE.BoxGeometry(0.28, 0.02, 0.02), sm, { cast: false }); l.position.set(s * 0.17, 0.05 - k * 0.04, 0); l.rotation.z = s * (0.5 - k * 0.25); spider.add(l); });
  const thread = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0)]), webM);
  const sx = 7.5, sz = -6.5, top = 8.6; thread.position.set(sx, top, sz); room.add(thread); spider.position.set(sx, 6, sz); room.add(spider);
  world.anim.push(t => { const y = 4.8 + Math.sin(t * 0.7) * 0.6; spider.position.y = y; thread.scale.y = top - y - 0.15; spider.rotation.y = Math.sin(t * 0.5) * 0.6; });
  // a bare bulb swinging gently from the rafters, flickering now and then
  const cord = new THREE.Group(); cord.position.set(-1.5, 8.4, 3.2); room.add(cord);
  const wire = mesh(new THREE.CylinderGeometry(0.015, 0.015, 3.2, 5), mat(0x1a1418), { cast: false }); wire.position.y = -1.6; cord.add(wire);
  const bulbM = new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffc861, emissiveIntensity: 1 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), bulbM); bulb.position.y = -3.3; cord.add(bulb);
  const glowL = new THREE.PointLight(0xffb066, 0.8, 14); glowL.position.y = -3.4; cord.add(glowL);
  let flick = 0;
  world.anim.push((t, dt) => {
    cord.rotation.z = Math.sin(t * 0.9) * 0.06; cord.rotation.x = Math.sin(t * 0.63) * 0.04;
    if (flick <= 0 && Math.random() < dt * 0.15) flick = 0.5;
    let k = 1; if (flick > 0) { flick -= dt; k = Math.sin(flick * 50) > 0 ? 1 : 0.45; }
    glowL.intensity = 0.8 * k; bulbM.emissiveIntensity = k;
  });
}
