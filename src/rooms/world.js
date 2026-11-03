/* The 3D stage: renderer, camera, lights, and the building blocks every room is made from. */
import { THREE } from '../lib/three.js';
import { $ } from '../lib/util.js';
import { world } from '../game/state.js';

export const W = 22, D = 16;
export const canvas = $('game');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xfff0d4, 0x6b4a3a, 0.8));
const sun = new THREE.DirectionalLight(0xffe0b0, 0.85);
sun.position.set(8, 18, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 50 }); sun.shadow.bias = -0.0008;
scene.add(sun);
export const room = new THREE.Group(); scene.add(room);

export function mat(color, opts) { return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, opts || {})); }
export function mesh(geo, m, { cast = true, recv = true } = {}) { const o = new THREE.Mesh(geo, m); o.castShadow = cast; o.receiveShadow = recv; return o; }
export function addCol(x, z, w, d) { world.cols.push({ x, z, w, d }); }
export function box(w, h, d, x, y, z, color, { collide = true, parent = room, opts } = {}) {
  const o = mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts)); o.position.set(x, y + h / 2, z); parent.add(o);
  if (collide) addCol(x, z, w, d); return o;
}
/* Cylinder standing on the floor. */
export function cyl(rt, rb, h, x, y, z, color, { collide = false, seg = 24, opts } = {}) {
  const o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, opts)); o.position.set(x, y + h / 2, z); room.add(o);
  if (collide) addCol(x, z, Math.max(rt, rb) * 2, Math.max(rt, rb) * 2); return o;
}
export function tex(draw, size = 512, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.encoding = THREE.sRGBEncoding; return t;
}
function planks(base, alt, line, rep) {
  return tex((g, s) => { g.fillStyle = base; g.fillRect(0, 0, s, s); const n = 8, h = s / n;
    for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? alt : base; g.fillRect(0, i * h, s, h); g.fillStyle = line; g.fillRect(0, i * h, s, 2);
      const off = (i * 137) % s; g.fillRect(off, i * h, 2, h); g.fillRect((off + s / 2) % s, i * h, 2, h); }
  }, 512, rep);
}
function wallpaper(bg, stripe, dot) {
  return tex((g, s) => { g.fillStyle = bg; g.fillRect(0, 0, s, s); g.fillStyle = stripe; for (let x = 0; x < s; x += 64) g.fillRect(x, 0, 18, s);
    g.fillStyle = dot; for (let y = 24; y < s; y += 64) for (let x = 41; x < s; x += 64) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
  }, 512, [4, 2]);
}
/* Square tiles with grout. `accent` sprinkles a few coloured tiles. */
function tiles(bg, grout, accent, n, rep) {
  return tex((g, s) => { const t = s / n; g.fillStyle = grout; g.fillRect(0, 0, s, s);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = accent && (x * 7 + y * 3) % 11 === 0 ? accent : bg; g.fillRect(x * t + 2, y * t + 2, t - 4, t - 4);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x * t + 4, y * t + 4, t * 0.3, 3); }
  }, 512, rep);
}

/* Floor and the two walls the camera can see. */
export function shell(theme) {
  const [fk, f1, f2, f3] = theme.floor[0] === 'tiles' ? theme.floor : ['planks', ...theme.floor];
  const floorT = fk === 'tiles' ? tiles(f1, f2, null, 8, [4, 3]) : planks(f1, f2, f3, [3, 2]);
  const [wk, w1, w2, w3] = theme.wall;
  const wallT = wk === 'wallpaper' ? wallpaper(w1, w2, w3) : wk === 'tiles' ? tiles(w1, w3, w2, 8, [5, 2]) : planks(w1, w2, w3, [2, 1]);
  const floor = mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.9 }), { cast: false });
  floor.rotation.x = -Math.PI / 2; floor.name = 'floor'; room.add(floor);
  const wm = new THREE.MeshStandardMaterial({ map: wallT, roughness: 0.95 });
  const back = mesh(new THREE.PlaneGeometry(W, 9), wm, { cast: false }); back.position.set(0, 4.5, -D / 2); room.add(back);
  const left = mesh(new THREE.PlaneGeometry(D, 9), wm, { cast: false }); left.rotation.y = Math.PI / 2; left.position.set(-W / 2, 4.5, 0); room.add(left);
  box(W, 0.5, 0.15, 0, 0, -D / 2 + 0.07, theme.trim, { collide: false }); box(0.15, 0.5, D, -W / 2 + 0.07, 0, 0, theme.trim, { collide: false });
  return floor;
}

/* The mouse hole to the next room. */
export function makeDoor(x) {
  const g = new THREE.Group();
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x1a1118 }));
  hole.position.set(0, 0, 0.02); g.add(hole);
  g.add(mesh(new THREE.TorusGeometry(1.05, 0.12, 8, 24, Math.PI), mat(0x5a3d2b)));
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.85, 32, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffc861, transparent: true, opacity: 0 }));
  glow.position.z = 0.03; g.add(glow);
  g.position.set(x, 0, -D / 2 + 0.02); room.add(g);
  const light = new THREE.PointLight(0xffb84d, 0, 6); light.position.set(x, 1, -D / 2 + 1); room.add(light);
  world.door = { x, z: -D / 2 + 0.9, glow, light, open: false };
}

export function makeMarker(x, z, gemY = 3.2) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 40), new THREE.MeshBasicMaterial({ color: 0xffc04d, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.03 + heightAt(x, z), z); room.add(ring);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(gemY < 2 ? 0.22 : 0.28), new THREE.MeshStandardMaterial({ color: 0xffc04d, emissive: 0xb06d00, emissiveIntensity: 0.6, roughness: 0.3 }));
  gem.position.set(x, gemY, z); room.add(gem);
  return { ring, gem, gemY };
}
export function makeCrumb(x, z) {
  const m = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 3), mat(0xffd34d, { emissive: 0x6b4a00, emissiveIntensity: 0.35 }));
  const y = 0.35 + heightAt(x, z);
  m.position.set(x, y, z); room.add(m); return { m, x, z, y, taken: false };
}

/* Places the floor is raised (the towel ramp into the tub). Each ramp is (x, z) => height or null. */
export function heightAt(x, z) { let h = 0; for (const r of world.ramps) { const v = r(x, z); if (v != null && v > h) h = v; } return h; }

export function clearRoom() {
  const mats = new Set(), maps = new Set();
  while (room.children.length) {
    const o = room.children.pop();
    o.traverse(n => {
      if (n.geometry) n.geometry.dispose();
      [].concat(n.material || []).forEach(m => { mats.add(m); if (m.map) maps.add(m.map); });
    });
  }
  maps.forEach(t => t.dispose()); mats.forEach(m => m.dispose()); // free GPU memory between rooms (phones)
  world.cols = []; world.ramps = []; world.fades = []; world.anim = []; world.catZs = []; world.lap = null;
}
