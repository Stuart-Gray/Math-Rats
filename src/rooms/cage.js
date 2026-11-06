/* Velma and Louise's home cage, on a little cabinet against the kitchen's left wall.
   The door on the front is left ajar (somebody forgot to latch it), and a wooden ramp leads
   down to the floor. The intro cutscene swings the door open and walks the rats down the ramp. */
import { THREE } from '../lib/three.js';
import { world } from '../game/state.js';
import { room, mesh, mat, box, addCol } from './world.js';

// cabinet footprint and the cage floor height (the cutscene walks on these)
export const CAGE = { x: -8.6, z: 4.8, w: 4.6, d: 3.8, top: 1.6, face: -6.45, doorZ0: 4.05, doorW: 1.5, rampEnd: -3.4 };
export const DOOR_AJAR = 0.35, DOOR_OPEN = 1.95;

function plaque() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#fff4df'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#b8862e'; g.lineWidth = 10; g.strokeRect(6, 6, 500, 116);
  g.fillStyle = '#3a2438'; g.font = '900 58px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Velma & Louise', 256, 66);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
}

export function buildCage() {
  const C = CAGE, x0 = C.x - C.w / 2 + 0.15, x1 = C.face, z0 = C.z - C.d / 2 + 0.15, z1 = C.z + C.d / 2 - 0.15;
  const cw = x1 - x0, cd = z1 - z0, H = 2.4, y0 = C.top;
  // the cabinet: warm wood with two drawers
  box(C.w, 1.3, C.d, C.x, 0, C.z, 0x9c6a3c, { collide: false });
  box(C.w + 0.12, 0.08, C.d + 0.12, C.x, 1.22, C.z, 0x7d532d, { collide: false });
  [-0.8, 0.8].forEach(dz => { box(0.04, 0.9, 1.4, C.x + C.w / 2 + 0.02, 0.2, C.z + dz, 0xb07a48, { collide: false });
    box(0.08, 0.1, 0.35, C.x + C.w / 2 + 0.06, 0.62, C.z + dz, 0xe8d5a8, { collide: false }); });
  addCol(C.x, C.z, C.w, C.d);
  // the tray: a teal plastic base with a name plaque on the front
  box(cw, 0.3, cd, (x0 + x1) / 2, 1.3, C.z, 0x5fa3a0, { collide: false });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshStandardMaterial({ map: plaque(), roughness: 0.8 }));
  pl.position.set((x0 + x1) / 2, 1.45, z1 + 0.01); room.add(pl);
  // bedding shreds
  const shred = mat(0xf0e2c0);
  for (let i = 0; i < 40; i++) { const s = mesh(new THREE.BoxGeometry(0.22, 0.03, 0.06), shred, { cast: false });
    s.position.set(x0 + 0.2 + Math.random() * (cw - 0.4), y0 + 0.02, z0 + 0.2 + Math.random() * (cd - 0.4)); s.rotation.y = Math.random() * 3; room.add(s); }
  // bars: thin silver rods all round, with a gap for the door on the front (+x) side
  const barM = mat(0xd8dce2, { metalness: 0.7, roughness: 0.3 }), barG = new THREE.CylinderGeometry(0.025, 0.025, H, 6);
  const rod = (x, z) => { const b = mesh(barG, barM, { cast: false }); b.position.set(x, y0 + H / 2, z); room.add(b); };
  for (let x = x0; x <= x1 + 0.01; x += 0.28) { rod(x, z0); rod(x, z1); }
  for (let z = z0 + 0.28; z < z1 - 0.1; z += 0.28) { rod(x0, z); if (z < C.doorZ0 - 0.05 || z > C.doorZ0 + C.doorW + 0.05) rod(x1, z); }
  // frame and roof
  const frame = mat(0xc0c6ce, { metalness: 0.7, roughness: 0.35 });
  [y0 + 0.02, y0 + H].forEach(y => { box(cw, 0.06, 0.06, (x0 + x1) / 2, y, z0, 0xc0c6ce, { collide: false, opts: { metalness: 0.7, roughness: 0.35 } });
    box(cw, 0.06, 0.06, (x0 + x1) / 2, y, z1, 0xc0c6ce, { collide: false, opts: { metalness: 0.7, roughness: 0.35 } });
    box(0.06, 0.06, cd, x0, y, C.z, 0xc0c6ce, { collide: false, opts: { metalness: 0.7, roughness: 0.35 } });
    box(0.06, 0.06, cd, x1, y, C.z, 0xc0c6ce, { collide: false, opts: { metalness: 0.7, roughness: 0.35 } }); });
  box(0.06, 0.06, C.doorW + 0.1, x1, y0 + C.doorW + 0.02, C.doorZ0 + C.doorW / 2, 0xc0c6ce, { collide: false, opts: { metalness: 0.7, roughness: 0.35 } });
  const roofG = new THREE.CylinderGeometry(0.02, 0.02, cd, 5);
  for (let x = x0 + 0.28; x < x1; x += 0.28) { const r = mesh(roofG, frame, { cast: false }); r.rotation.x = Math.PI / 2; r.position.set(x, y0 + H, C.z); room.add(r); }
  // a hammock hanging from the roof, and a water bottle clipped to the back bars
  const ham = mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.5, 16, 1, true, Math.PI, Math.PI), mat(0xd9536f, { side: THREE.DoubleSide }), { cast: false });
  ham.rotation.z = Math.PI / 2; ham.position.set(x0 + 0.9, y0 + H - 0.55, z0 + 0.9); room.add(ham);
  const bottle = mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 14), new THREE.MeshStandardMaterial({ color: 0xbfe3f0, transparent: true, opacity: 0.6, roughness: 0.1 }), { cast: false });
  bottle.position.set(x0 + 2.2, y0 + 1.5, z0 + 0.22); room.add(bottle);
  const spout = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), barM, { cast: false }); spout.rotation.z = 0.9; spout.position.set(x0 + 2.0, y0 + 0.95, z0 + 0.22); room.add(spout);
  // a food bowl with a few seeds
  const bowl = mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.16, 18), mat(0xf0a92e)); bowl.position.set(x0 + 0.5, y0 + 0.08, z1 - 0.5); room.add(bowl);
  // the door: hinged at its back edge, left ajar
  const door = new THREE.Group(); door.position.set(x1, y0, C.doorZ0); room.add(door);
  [0.02, C.doorW - 0.02].forEach(y => { const f = mesh(new THREE.BoxGeometry(0.05, 0.05, C.doorW), frame, { cast: false }); f.position.set(0, y, C.doorW / 2); door.add(f); });
  const dbar = new THREE.CylinderGeometry(0.022, 0.022, C.doorW, 6);
  for (let z = 0.05; z < C.doorW; z += 0.24) { const b = mesh(dbar, barM, { cast: false }); b.position.set(0, C.doorW / 2, z); door.add(b); }
  const latch = mesh(new THREE.BoxGeometry(0.1, 0.18, 0.06), mat(0xf0a92e, { metalness: 0.5, roughness: 0.4 }), { cast: false }); latch.position.set(0.04, C.doorW / 2, C.doorW - 0.04); door.add(latch);
  door.rotation.y = DOOR_AJAR;
  // the ramp: a wooden board with little rungs, from the door down to the floor
  const len = Math.hypot(C.rampEnd - x1, y0), ang = Math.atan2(y0, C.rampEnd - x1);
  const ramp = new THREE.Group(); ramp.position.set((x1 + C.rampEnd) / 2, y0 / 2, C.doorZ0 + C.doorW / 2); ramp.rotation.z = -ang; room.add(ramp);
  ramp.add(mesh(new THREE.BoxGeometry(len, 0.1, C.doorW - 0.1), mat(0xc48a50)));
  for (let k = -len / 2 + 0.3; k < len / 2 - 0.1; k += 0.4) { const r = mesh(new THREE.BoxGeometry(0.06, 0.05, C.doorW - 0.2), mat(0x8d5b31), { cast: false }); r.position.set(k, 0.07, 0); ramp.add(r); }
  addCol((x1 + C.rampEnd) / 2 + 0.3, C.doorZ0 + C.doorW / 2, x1 - C.rampEnd - 0.6, C.doorW);
  // heights for the cutscene: the cage floor, and the slope of the ramp
  world.ramps.push((x, z) => {
    if (x > x0 - 0.1 && x < x1 + 0.05 && z > z0 && z < z1) return y0;
    if (x >= x1 && x <= C.rampEnd && z > C.doorZ0 - 0.3 && z < C.doorZ0 + C.doorW + 0.3) return y0 * (C.rampEnd - x) / (C.rampEnd - x1) + 0.05;
    return null;
  });
  world.cage = { door };
}
