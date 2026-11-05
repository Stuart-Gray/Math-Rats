/* The furniture and props in each room. Each function builds one room; the story for each is in data.js. */
import { THREE } from '../lib/three.js';
import { pick } from '../lib/util.js';
import { world } from '../game/state.js';
import { room, mesh, mat, box, cyl, addCol, makeDoor, D } from './world.js';
import { makeCat } from '../rats/cat.js';
import { say } from '../ui/speech.js';
import { sfx } from '../audio/audio.js';

function kitchen(R) {
    box(9,3.4,2.2,3.5,0,-6.9,0x6d8fa3); box(9.4,0.3,2.4,3.5,3.4,-6.9,0xefe2c9,{collide:false});
    for(let i=0;i<4;i++) box(0.12,0.12,0.06,0.2+i*2.2,2.6,-5.78,0xe8d5a8,{collide:false});
    box(3.2,7,2.6,-8.8,0,-6.6,0xcfe2d4);
    box(3.0,0.08,0.05,-8.8,4.3,-5.28,0x9fb8a6,{collide:false});
    const mags=[0xd9536f,0xf0a92e,0x5f9272,0x3f6fb0,0x8a5a7a];
    mags.forEach((c,i)=>box(0.32,0.38,0.08,-9.9+i*0.55,2.2+(i%2)*0.5,-5.28,c,{collide:false}));
    const rug=mesh(new THREE.CircleGeometry(3.4,40),mat(0xd88c6a),{cast:false}); rug.scale.set(1.2,0.8,1); rug.rotation.x=-Math.PI/2; rug.position.set(1,0.01,1.5); room.add(rug);
    box(5.2,0.25,3.2,1,2.6,1.5,0x9c6a3c,{collide:false});
    [[-1.3,0.2],[3.3,0.2],[-1.3,2.8],[3.3,2.8]].forEach(([x,z])=>box(0.25,2.6,0.25,x,0,z,0x7d532d));
    box(1.6,0.35,1.2,6.5,0,-2.5,0xb9bcc2,{opts:{metalness:0.4,roughness:0.4}});
    const jar=mesh(new THREE.CylinderGeometry(0.55,0.55,1.15,24),new THREE.MeshStandardMaterial({color:0xcfe8f2,transparent:true,opacity:0.55,roughness:0.1}));
    jar.position.set(6.5,0.93,-2.5); room.add(jar);
    [0,1,2].forEach(i=>{ const ck=mesh(new THREE.CylinderGeometry(0.3,0.3,0.1,16),mat(0xb0723a)); ck.position.set(6.5+(i-1)*0.15,0.45+i*0.13,-2.5); ck.rotation.z=0.2*(i-1); room.add(ck); });
    const lid=mesh(new THREE.CylinderGeometry(0.6,0.6,0.15,24),mat(0xd9536f)); lid.position.set(6.5,1.58,-2.5); room.add(lid);
    box(1.6,1,1.2,7.5,0,4,0xb38654); box(1.2,0.8,0.7,7.5,1,4,0xc9ccd1,{collide:false,opts:{metalness:0.6,roughness:0.3}});
    [-0.2,0.2].forEach(dx=>box(0.12,0.35,0.5,7.5+dx,1.7,4,0xe0b070,{collide:false}));
    makeDoor(R.door);
}

function livingRoom(R) {
    box(7,1.4,2.4,2.5,0,-6.4,0x8a5a7a); box(7,2.6,0.8,2.5,0,-7.5,0x7a4c6c); box(0.8,2,2.6,-1.4,0,-6.5,0x7a4c6c); box(0.8,2,2.6,6.4,0,-6.5,0x7a4c6c);
    [0,1].forEach(i=>box(2.6,0.5,1.8,1.1+i*2.8,1.4,-6.3,0xe9b44c,{collide:false}));
    box(1.2,6,4,-10.3,0,-2,0x6b4a33);
    const bc=[0xd9536f,0x3f6fb0,0xf0a92e,0x5f9272,0xf3e4c4];
    for(let s=0;s<3;s++) for(let i=0;i<6;i++) box(0.9,0.9+((i*7+s)%3)*0.15,0.38,-10.1,0.6+s*1.9,-3.5+i*0.55,bc[(i+s)%5],{collide:false});
    box(4,3.2,1.8,8,0,-7,0x2a2028,{opts:{roughness:0.3}}); box(3.6,0.15,0.6,8,2.1,-5.85,0xfaf6ee,{collide:false});
    for(let i=0;i<7;i++) box(0.18,0.1,0.35,6.6+i*0.5,2.25,-5.95,0x1a1118,{collide:false});
    const rug=mesh(new THREE.CircleGeometry(3.6,48),mat(0x5f9272),{cast:false}); rug.rotation.x=-Math.PI/2; rug.position.set(0.5,0.01,1); room.add(rug);
    const rug2=mesh(new THREE.RingGeometry(2.9,3.2,48),mat(0xf0a92e),{cast:false}); rug2.rotation.x=-Math.PI/2; rug2.position.set(0.5,0.015,1); room.add(rug2);
    makeCat(0.5,0.6);
    const bk=mesh(new THREE.CylinderGeometry(1,0.85,1.2,20),mat(0xc9a26b)); bk.position.set(-6,0.6,4); room.add(bk); addCol(-6,4,1.9,1.9);
    [0xd9536f,0x3f6fb0,0xfff4df,0xf0a92e].forEach((c,i)=>{ const s=mesh(new THREE.SphereGeometry(0.35,12,10),mat(c)); s.scale.set(1.2,0.5,0.8); s.position.set(-6+Math.cos(i*1.6)*0.5,1.25+i*0.08,4+Math.sin(i*1.6)*0.5); room.add(s); });
    box(0.25,5,0.25,-9.5,0,-6.5,0x3a2a22); const shade=mesh(new THREE.ConeGeometry(0.9,1,20,1,true),mat(0xf3d39a,{side:THREE.DoubleSide,emissive:0x6b4a10})); shade.position.set(-9.5,5.2,-6.5); room.add(shade);
    const lamp=new THREE.PointLight(0xffc27a,0.6,14); lamp.position.set(-9.5,4.6,-6.5); room.add(lamp);
    makeDoor(R.door);
}

/* Velma and Louise's favourite place to explore: under the vanity, up the towel into the tub, and laps around the toilet. */
function bathroom(R) {
  const white = 0xfbf8f2, chrome = { metalness: 0.8, roughness: 0.25 };
  // --- vanity on the back wall, raised on legs so the rats can scurry underneath ---
  const vx = -4.8, vz = -6.7, vw = 4.8, vd = 2.6, vy = 1.7;
  const fadeMeshes = [];
  fadeMeshes.push(box(vw, 1.9, vd, vx, vy, vz, 0x6f9fb1, { collide: false }));
  fadeMeshes.push(box(vw + 0.3, 0.22, vd + 0.2, vx, vy + 1.9, vz, 0xf3ede2, { collide: false }));
  [-1, 1].forEach(s => { fadeMeshes.push(box(vw / 2 - 0.25, 1.6, 0.06, vx + s * vw / 4, vy + 0.15, vz + vd / 2 + 0.02, 0x7fb0c1, { collide: false }));
    fadeMeshes.push(box(0.12, 0.3, 0.1, vx + s * 0.35, vy + 0.9, vz + vd / 2 + 0.08, 0xd8b24a, { collide: false, opts: chrome })); });
  const basin = mesh(new THREE.CylinderGeometry(0.9, 0.7, 0.2, 28), mat(white, { roughness: 0.3 })); basin.scale.set(1.2, 1, 0.8); basin.position.set(vx, vy + 2.13, vz + 0.2); room.add(basin); fadeMeshes.push(basin);
  const tap = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 10), mat(0xc9ccd1, chrome)); tap.position.set(vx, vy + 2.4, vz - 0.75); room.add(tap); fadeMeshes.push(tap);
  const spout = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 10), mat(0xc9ccd1, chrome)); spout.rotation.x = Math.PI / 2; spout.position.set(vx, vy + 2.65, vz - 0.55); room.add(spout); fadeMeshes.push(spout);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(0.22, vy, 0.22, vx + sx * (vw / 2 - 0.15), 0, vz + sz * (vd / 2 - 0.15), 0x5b8798));
  world.fades.push({ meshes: fadeMeshes, x0: vx - vw / 2 - 0.3, x1: vx + vw / 2 + 0.3, z0: -8, z1: vz + vd / 2 + 0.6 });
  const mirror = mesh(new THREE.PlaneGeometry(3.4, 2.6), new THREE.MeshStandardMaterial({ color: 0xcfe6f2, metalness: 0.6, roughness: 0.1 }), { cast: false }); mirror.position.set(vx, 5.9, -D / 2 + 0.04); room.add(mirror);
  const mf = mesh(new THREE.TorusGeometry(1.9, 0.1, 8, 4), mat(0xd8b24a, chrome)); mf.rotation.z = Math.PI / 4; mf.scale.set(1.25, 0.95, 1); mf.position.set(vx, 5.9, -D / 2 + 0.06); room.add(mf);
  // the drippy pipe and its bottle cap
  const pipeM = mat(0xc9ccd1, chrome);
  const p1 = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 10), pipeM); p1.position.set(vx + 0.4, vy - 0.4, vz - 0.3); room.add(p1);
  const trap = mesh(new THREE.TorusGeometry(0.25, 0.1, 8, 16, Math.PI), pipeM); trap.rotation.set(0, Math.PI / 2, Math.PI); trap.position.set(vx + 0.4, vy - 0.8, vz - 0.55); room.add(trap);
  const p2 = mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.1, 10), pipeM); p2.rotation.x = Math.PI / 2; p2.position.set(vx + 0.4, vy - 0.55, vz - 1.15); room.add(p2);
  const cap = mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.12, 16), mat(0xd9536f)); cap.position.set(vx + 0.4, 0.06, vz - 0.85); room.add(cap);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0x9fd3f0, transparent: true, opacity: 0.85, roughness: 0.1 })); room.add(drop);
  world.anim.push(t => { const k = (t * 0.7) % 1; drop.position.set(vx + 0.4, vy - 0.95 - k * (vy - 1.05), vz - 0.85); drop.visible = k < 0.95; });
  const bottle = mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.8, 14), mat(0xe58fb3, { roughness: 0.4 })); bottle.position.set(vx - 1.6, 0.4, vz - 0.5); room.add(bottle); addCol(vx - 1.6, vz - 0.5, 0.5, 0.5);

  // --- the bathtub, with a towel ramp so the rats can climb in and out ---
  const tx0 = 3.2, tx1 = 10.8, tz0 = -8, tz1 = -4.0, th = 1.5, wall = 0.35, floorY = 0.25, gx0 = 4.6, gx1 = 8.2; // towel gap wide enough for both rats side by side
  const tub = 0xf7f4ef, tubOpts = { roughness: 0.25 };
  box(tx1 - tx0, floorY, tz1 - tz0, (tx0 + tx1) / 2, 0, (tz0 + tz1) / 2, tub, { collide: false, opts: tubOpts });
  box(wall, th, tz1 - tz0, tx0 + wall / 2, 0, (tz0 + tz1) / 2, tub, { opts: tubOpts });
  box(wall, th, tz1 - tz0, tx1 - wall / 2, 0, (tz0 + tz1) / 2, tub, { opts: tubOpts });
  box(tx1 - tx0, th, wall, (tx0 + tx1) / 2, 0, tz0 + wall / 2 + 0.1, tub, { opts: tubOpts });
  // front wall in two pieces, leaving a gap where the towel drapes over
  box(gx0 - tx0, th, wall, (tx0 + gx0) / 2, 0, tz1 - wall / 2, tub, { opts: tubOpts });
  box(tx1 - gx1, th, wall, (gx1 + tx1) / 2, 0, tz1 - wall / 2, tub, { opts: tubOpts });
  box(gx1 - gx0, th, wall, (gx0 + gx1) / 2, 0, tz1 - wall / 2, tub, { collide: false, opts: tubOpts });
  box(tx1 - tx0 + 0.1, 0.12, 0.5, (tx0 + tx1) / 2, th, tz1 - 0.2, 0xffffff, { collide: false, opts: tubOpts });
  [[tx0 + 0.4, tz1 - 0.3], [tx1 - 0.4, tz1 - 0.3]].forEach(([x, z]) => { const f = mesh(new THREE.SphereGeometry(0.22, 10, 8), mat(0xd8b24a, chrome)); f.position.set(x, 0.12, z + 0.1); room.add(f); });
  // towel ramp: up from the bath mat, over the rim, down inside
  const towel = 0x8fc3e8, outZ = -1.6, topZ0 = tz1 + 0.05, topZ1 = tz1 - wall - 0.05, inZ = -5.9, top = th + 0.1;
  const slab = (z0, y0, z1, y1) => { const dz = z1 - z0, dy = y1 - y0, len = Math.hypot(dz, dy);
    const m = mesh(new THREE.BoxGeometry(gx1 - gx0 - 0.1, 0.1, len), mat(towel, { roughness: 1 })); m.position.set((gx0 + gx1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.rotation.x = Math.atan2(-dy, dz); room.add(m); };
  slab(outZ, 0.03, topZ0, top); slab(topZ0, top, topZ1, top); slab(topZ1, top, inZ, floorY + 0.03);
  for (let i = 0; i < 8; i++) box(0.08, 0.02, 0.6, gx0 + 0.225 + i * 0.45, 0.02, outZ + 0.2, 0xffffff, { collide: false });
  world.ramps.push((x, z) => {
    if (x >= tx0 + wall && x <= tx1 - wall && z >= tz0 && z <= topZ1) {
      if (x >= gx0 && x <= gx1 && z > inZ) return floorY + (top - floorY) * (z - inZ) / (topZ1 - inZ);
      return floorY;
    }
    if (x >= gx0 && x <= gx1) {
      if (z >= topZ1 && z <= topZ0) return top;
      if (z > topZ0 && z <= outZ) return top * (outZ - z) / (outZ - topZ0);
    }
    return null;
  });
  let inTub = false, saidTub = false, wasIn = false;
  world.anim.push((t, dt, vp) => {
    const now = vp.x > tx0 + wall && vp.x < tx1 - wall && vp.z < topZ1 - 0.3;
    if (now && !inTub) { sfx('splash'); if (!saidTub) { saidTub = true; say('l', 'We are in the tub! No water, just a big slippery skate park.'); } }
    if (!now && inTub) wasIn = true;
    if (wasIn && vp.z > outZ - 0.4) { wasIn = false; say('v', pick(['Out of the tub! Wheee!', 'Towel slide: ten out of ten.']), { minor: true }); }
    inTub = now;
  });
  const mat2 = mesh(new THREE.CircleGeometry(1.6, 32), mat(0x9ed8c8, { roughness: 1 }), { cast: false }); mat2.scale.set(1.4, 0.8, 1); mat2.rotation.x = -Math.PI / 2; mat2.position.set(6.4, 0.012, -0.6); room.add(mat2);
  const faucet = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 10), mat(0xc9ccd1, chrome)); faucet.rotation.x = Math.PI / 2; faucet.position.set(9.6, 2.4, -7.5); room.add(faucet);
  // rubber ducks bobbing in the tub
  const duck = (x, z, s) => { const g = new THREE.Group(); const y = mat(0xffd23f, { roughness: 0.5 });
    const b = mesh(new THREE.SphereGeometry(0.32, 14, 10), y); b.scale.set(1.2, 0.8, 1); g.add(b);
    const h = mesh(new THREE.SphereGeometry(0.2, 12, 10), y); h.position.set(0.25, 0.3, 0); g.add(h);
    const bk = mesh(new THREE.ConeGeometry(0.08, 0.2, 8), mat(0xf08a24)); bk.rotation.z = -Math.PI / 2; bk.position.set(0.48, 0.28, 0); g.add(bk);
    [-1, 1].forEach(e => { const eye = mesh(new THREE.SphereGeometry(0.03, 6, 5), mat(0x111111)); eye.position.set(0.36, 0.38, 0.1 * e); g.add(eye); });
    g.scale.setScalar(s); g.position.set(x, floorY + 0.25 * s, z); g.rotation.y = Math.random() * 6; room.add(g);
    const ph = Math.random() * 6; world.anim.push(t => { g.rotation.z = Math.sin(t * 2 + ph) * 0.08; });
  };
  duck(9.4, -7.0, 1.4); duck(4.5, -6.9, 1); duck(9.6, -5.0, 0.9);
  // soap bubbles drifting up
  const bubM = new THREE.MeshStandardMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.2 });
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.18, 12, 8), bubM);
    const bx = 4 + Math.random() * 6, bz = -7.3 + Math.random() * 2.8, ph = Math.random(); room.add(b);
    world.anim.push(t => { const k = (t * 0.12 + ph) % 1; b.position.set(bx + Math.sin(t + ph * 9) * 0.3, 0.6 + k * 5, bz); b.scale.setScalar(k < 0.9 ? 1 : (1 - k) * 10); }); }

  // --- the toilet on the left wall, with room to run laps around its base ---
  const cx = -8.9, cz = 2.2;
  cyl(0.42, 0.55, 0.9, cx, 0, cz, white, { opts: { roughness: 0.3 } }); addCol(cx, cz, 1.0, 1.0);
  const bowl = mesh(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(white, { roughness: 0.3, side: THREE.DoubleSide })); bowl.rotation.x = Math.PI; bowl.scale.set(1.25, 0.55, 0.85); bowl.position.set(cx - 0.4, 1.45, cz); room.add(bowl);
  const seat = mesh(new THREE.TorusGeometry(0.85, 0.12, 8, 24), mat(0xffffff, { roughness: 0.4 })); seat.rotation.x = Math.PI / 2; seat.scale.set(1.3, 0.9, 1); seat.position.set(cx - 0.4, 1.48, cz); room.add(seat);
  const lidM = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 24), mat(0xffffff, { roughness: 0.4 })); lidM.scale.set(1.15, 1, 0.85); lidM.rotation.z = -1.35; lidM.position.set(-10.35, 2.4, cz); room.add(lidM);
  box(0.7, 1.7, 1.9, -10.65, 1.5, cz, white, { collide: false, opts: { roughness: 0.3 } });
  box(0.3, 0.08, 0.08, -10.25, 3.0, cz - 0.6, 0xc9ccd1, { collide: false, opts: chrome });
  world.lap = { x: cx, z: cz, r: 2.7, sum: 0, last: null, done: false };
  // toilet paper tower
  const rollM = mat(0xffffff, { roughness: 0.9 });
  [[0, 0, 0], [0.7, 0, 0], [0.35, 0.62, 0], [0, 0, 0.7], [0.7, 0, 0.7], [0.35, 0.62, 0.7], [0.35, 1.24, 0.35]].forEach(([dx, dy, dz]) => {
    const r = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.62, 16), rollM); r.position.set(-8.0 + dx, 0.31 + dy, 5.8 + dz); room.add(r); });
  addCol(-7.65, 6.15, 1.45, 1.45);
  const holder = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.55, 16), rollM); holder.rotation.x = Math.PI / 2; holder.position.set(-10.7, 2.0, 4.3); holder.rotation.z = Math.PI / 2; room.add(holder);
  // towel bar + hanging towel on the left wall
  box(0.1, 0.1, 3, -10.85, 4.4, -2.5, 0xc9ccd1, { collide: false, opts: chrome });
  box(0.08, 2.4, 2.6, -10.8, 2.1, -2.5, 0xf2b8c6, { collide: false, opts: { roughness: 1 } });
  makeDoor(R.door);
}

function attic(R) {
    for(let i=-2;i<=2;i++){ const beam=mesh(new THREE.BoxGeometry(0.5,0.5,D+2),mat(0x4f3a26)); beam.position.set(i*4.5,8.2,0); room.add(beam); }
    const win=new THREE.Mesh(new THREE.CircleGeometry(1.3,32),new THREE.MeshBasicMaterial({color:0xbfd8ec})); win.position.set(1.5,5.6,-D/2+0.03); room.add(win);
    const wf=mesh(new THREE.TorusGeometry(1.35,0.12,8,32),mat(0x3a2a1c)); wf.position.set(1.5,5.6,-D/2+0.06); room.add(wf);
    const moon=new THREE.PointLight(0x9fc3ff,0.5,16); moon.position.set(1.5,5,-5); room.add(moon);
    box(3,1.6,1.8,-6,0,-5.4,0x7a4a2a); box(3.1,0.25,1.9,-6,1.6,-5.4,0x6a3e22,{collide:false});
    [-0.9,0.9].forEach(dx=>box(0.18,1.86,1.86,-6+dx,0,-5.4,0x8d8a80,{collide:false,opts:{metalness:0.6,roughness:0.4}}));
    box(0.5,0.4,0.1,-6,0.9,-4.47,0xd8b24a,{collide:false,opts:{metalness:0.7,roughness:0.3}});
    box(1,4.4,0.2,5,0,-7.85,0x6e5a44,{collide:false});
    const tube=mesh(new THREE.CylinderGeometry(0.1,0.1,3.4,12),mat(0xf5f1ea)); tube.position.set(5,2.4,-7.65); room.add(tube);
    const merc=mesh(new THREE.CylinderGeometry(0.06,0.06,1.0,10),mat(0xd9363f)); merc.position.set(5,1.2,-7.6); room.add(merc);
    const bulb=mesh(new THREE.SphereGeometry(0.2,12,10),mat(0xd9363f)); bulb.position.set(5,0.55,-7.62); room.add(bulb);
    box(1.4,0.9,1.0,6,0,4,0xc77b9a); box(0.08,0.5,0.08,6.75,0.5,4,0xd8b24a,{collide:false});
    box(2,1.6,2,8.8,0,-3,0xb08a5a); box(1.6,1.2,1.6,8.8,1.6,-3,0xa47d4e,{collide:false}); box(2.2,1.8,2,-8.6,0,3,0xb08a5a); box(1.6,1,1.6,-8.4,1.8,3.1,0xc29a68,{collide:false});
    const lantern=new THREE.PointLight(0xffb066,0.7,12); lantern.position.set(-2,3,0); room.add(lantern);
    makeDoor(R.door);
}

const BUILDERS = [kitchen, livingRoom, bathroom, attic];
export function furnish(r, R) { BUILDERS[r](R); }
