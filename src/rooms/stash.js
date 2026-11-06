/* The Legendary Snack Stash: a cozy nook behind the attic's last mouse hole, where the ending
   cutscene plays. A mountain of sunflower seeds, three whole crackers and one perfect blueberry,
   under fairy lights, with glints of sparkle floating up from the pile. */
import { THREE } from '../lib/three.js';
import { world } from '../game/state.js';
import { room, mesh, mat, box, W, D } from './world.js';
import { picture } from './decor.js';

export const STASH_THEME = { floor: ['#9b7650', '#94704b', '#5e452d'], wall: ['planks', '#8a6544', '#835f40', '#57402a'], trim: 0x4a3424, bg: 0x3b2d40, out: 0x3a2e3e };
export const PILE = { x: 2.5, z: -2.5, r: 2.9, h: 2.5 };
export const HOLE_X = -6;

export function buildStash() {
  const P = PILE;
  // the stash is a closed-in nook: a full right wall too, so the camera can look that way
  const rw = mesh(new THREE.PlaneGeometry(D, 9), mat(0x7a5a3c, { roughness: 0.95 }), { cast: false }); rw.rotation.y = -Math.PI / 2; rw.position.set(W / 2 + 0.01, 4.5, 0); room.add(rw);
  for (let y = 1.1; y < 9; y += 1.1) box(0.05, 0.05, D, W / 2 - 0.02, y, 0, 0x57402a, { collide: false });
  // the mouse hole they came through (already open, glowing softly)
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x1a1118 }));
  hole.position.set(HOLE_X, 0, -D / 2 + 0.02); room.add(hole);
  const arch = mesh(new THREE.TorusGeometry(1.05, 0.12, 8, 24, Math.PI), mat(0x5a3d2b)); arch.position.set(HOLE_X, 0, -D / 2 + 0.02); room.add(arch);
  // the seed mountain: a solid core, then hundreds of striped sunflower seeds on its surface
  const core = mesh(new THREE.ConeGeometry(P.r * 0.95, P.h * 0.92, 40), mat(0x4a3f36, { roughness: 1 })); core.position.set(P.x, P.h * 0.46, P.z); room.add(core);
  const seedG = new THREE.SphereGeometry(0.16, 8, 6); seedG.scale(0.55, 0.32, 1);
  const N = 700, dark = new THREE.InstancedMesh(seedG, mat(0x2f2a27, { roughness: 0.6 }), N), light = new THREE.InstancedMesh(seedG, mat(0xd8d0c0, { roughness: 0.6 }), N / 2);
  const o = new THREE.Object3D();
  const place = (im, n) => { for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, rr = P.r * Math.sqrt(Math.random()) * 1.02, y = P.h * Math.max(0, 1 - rr / P.r) + 0.05 + Math.random() * 0.08;
    o.position.set(P.x + Math.cos(a) * rr, y, P.z + Math.sin(a) * rr); o.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
    im.castShadow = true; im.receiveShadow = true; room.add(im); };
  place(dark, N); place(light, N / 2);
  // a few seeds spilled on the floor
  const spill = new THREE.InstancedMesh(seedG, mat(0x2f2a27, { roughness: 0.6 }), 60);
  for (let i = 0; i < 60; i++) { const a = Math.random() * Math.PI * 2, rr = P.r + 0.2 + Math.random() * 1.6;
    o.position.set(P.x + Math.cos(a) * rr, 0.05, P.z + Math.sin(a) * rr); o.rotation.set(0, Math.random() * 3, Math.PI / 2 * (Math.random() < 0.5 ? 0 : 1)); o.updateMatrix(); spill.setMatrixAt(i, o.matrix); }
  room.add(spill);
  // three whole crackers, leaning on the pile, with little docking holes
  const ct = document.createElement('canvas'); ct.width = ct.height = 128; const g = ct.getContext('2d');
  g.fillStyle = '#e6b45e'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#b07a32'; for (let y = 20; y < 128; y += 28) for (let x = 20; x < 128; x += 28) { g.beginPath(); g.arc(x, y, 3.5, 0, 7); g.fill(); }
  g.strokeStyle = '#c99040'; g.lineWidth = 6; g.strokeRect(3, 3, 122, 122);
  const crackT = new THREE.CanvasTexture(ct); crackT.encoding = THREE.sRGBEncoding;
  const crackM = new THREE.MeshStandardMaterial({ map: crackT, roughness: 0.8 });
  [[-0.9, 0.55, 0.5], [0.7, 0.4, 2.3], [2.2, 0.5, -2.5]].forEach(([a, y, tilt]) => {
    const c = mesh(new THREE.BoxGeometry(1.5, 0.14, 1.5), crackM);
    const rr = P.r * 0.78; c.position.set(P.x + Math.cos(a) * rr, y + 0.25, P.z + Math.sin(a) * rr);
    c.rotation.set(0, -a, 0); c.rotateZ(0.9); c.rotateX(tilt * 0.08); room.add(c);
  });
  // one perfect blueberry on the summit, with its little crown, a spotlight and a glow
  const berry = new THREE.Group(); berry.position.set(P.x, P.h + 0.45, P.z); room.add(berry);
  berry.add(mesh(new THREE.SphereGeometry(0.5, 32, 24), new THREE.MeshStandardMaterial({ color: 0x34449a, roughness: 0.32, metalness: 0.05, emissive: 0x101850, emissiveIntensity: 0.6 })));
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, s = mesh(new THREE.ConeGeometry(0.07, 0.16, 5), mat(0x1e2450), { cast: false });
    s.position.set(Math.cos(a) * 0.12, 0.48, Math.sin(a) * 0.12); s.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); berry.add(s); }
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xaab8ff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(2.4, 2.4, 1); berry.add(halo);
  const spot = new THREE.SpotLight(0xfff0d0, 1.2, 20, 0.45, 0.6); spot.position.set(P.x, 8.5, P.z + 1); spot.target.position.set(P.x, 0, P.z); room.add(spot); room.add(spot.target);
  const warm = new THREE.PointLight(0xffb066, 0.8, 16); warm.position.set(-3, 4, 2); room.add(warm);
  // fairy lights along the back and left walls
  const cols = [0xffd34d, 0xff8aa0, 0x8fd0ff, 0xb9f28a], bulbs = [];
  for (let i = 0; i < 26; i++) { const k = i / 25, x = -10.5 + k * 21, y = 6.2 - Math.sin(k * Math.PI * 4) ** 2 * 0.7;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: cols[i % 4] })); b.position.set(x, y, -D / 2 + 0.15); room.add(b); bulbs.push(b); }
  // the sign
  picture({ at: 4.5, y: 5.0, w: 4.4, h: 1.3, frame: 0xa8822e, frameW: 0.12, glow: 0.5, draw: (g2, w, h) => {
    g2.fillStyle = '#3a2438'; g2.fillRect(0, 0, w, h);
    g2.fillStyle = '#ffd34d'; g2.font = '900 64px Georgia, serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle';
    g2.fillText('The Legendary Snack Stash', w / 2, h / 2 - 8);
    g2.fillStyle = '#fff4df'; g2.font = '700 26px Georgia, serif'; g2.fillText('est. by two very good rats', w / 2, h - 22);
  } });
  // a couple of crates and an old teacup
  box(2.2, 1.6, 1.8, -9, 0, -6.4, 0x8a6a4a, { collide: false }); box(1.6, 1.2, 1.4, -9.2, 1.6, -6.4, 0x9c7a56, { collide: false });
  box(2, 1.4, 2, 9, 0, 5.5, 0x8a6a4a, { collide: false });
  const cup = mesh(new THREE.CylinderGeometry(0.45, 0.32, 0.55, 20), mat(0xf3ede2, { roughness: 0.4 })); cup.position.set(-8.6, 0.28, 3.8); room.add(cup);
  // sparkles drifting up from the pile
  const sp = [], spT = glowTex(), spM = new THREE.SpriteMaterial({ map: spT, color: 0xffe9a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 24; i++) { const s = new THREE.Sprite(spM.clone()); s.userData = { a: Math.random() * 6.3, r: Math.random() * P.r * 0.8, ph: Math.random(), sp: 0.15 + Math.random() * 0.2 }; room.add(s); sp.push(s); }
  world.anim.push((t, dt) => {
    berry.rotation.y = t * 0.5; berry.position.y = P.h + 0.45 + Math.sin(t * 1.6) * 0.06; halo.material.opacity = 0.45 + Math.sin(t * 2.2) * 0.15;
    bulbs.forEach((b, i) => b.scale.setScalar(0.8 + 0.35 * Math.max(0, Math.sin(t * 2 + i * 1.3))));
    for (const s of sp) { const u = s.userData, k = (t * u.sp + u.ph) % 1;
      s.position.set(P.x + Math.cos(u.a + k * 2) * u.r, P.h * (1 - u.r / P.r) + k * 3.2, P.z + Math.sin(u.a + k * 2) * u.r);
      s.material.opacity = Math.sin(k * Math.PI) * 0.9; const sc = 0.25 + 0.2 * Math.sin(k * Math.PI); s.scale.set(sc, sc, 1); }
  });
  world.door = null;
}

function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
