/* Velma and Louise, sculpted from their photos: chocolate brown, big cupped pink ears,
   fawn muzzle, pink nose, glossy black eyes, long whiskers and thick scaly tails.
   Louise is lighter with a broad white belly; Velma has a thin white chest stripe. */
import { THREE } from '../lib/three.js';
import { scene, mesh } from '../rooms/world.js';

/* rats — sculpted from Velma & Louise's photos */
function furTextures(){
  const c=document.createElement('canvas'); c.width=c.height=512; const g=c.getContext('2d');
  g.fillStyle='#e4e0dc'; g.fillRect(0,0,512,512);
  for(let i=0;i<9000;i++){
    const x=Math.random()*512, y=Math.random()*512, len=6+Math.random()*14, lean=(Math.random()-0.5)*3;
    const light=Math.random()<0.45;
    g.strokeStyle= light?`rgba(255,248,240,${0.18+Math.random()*0.3})`:`rgba(20,10,5,${0.12+Math.random()*0.22})`;
    g.lineWidth=0.8+Math.random()*1.4; g.beginPath(); g.moveTo(x,y); g.lineTo(x+lean,y+len); g.stroke();
  }
  const mk=()=>{ const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(5,2); return t; };
  const map=mk(); map.encoding=THREE.sRGBEncoding; return {map,bump:mk()};
}
function tailTexture(){
  const c=document.createElement('canvas'); c.width=64; c.height=512; const g=c.getContext('2d');
  g.fillStyle='#ffffff'; g.fillRect(0,0,64,512);
  for(let y=0;y<512;y+=7){ g.fillStyle='rgba(90,50,40,0.35)'; g.fillRect(0,y,64,1.5);
    for(let x=0;x<64;x+=8){ g.fillStyle='rgba(90,50,40,0.18)'; g.fillRect(x+((y/7)%2)*4,y,1,7); } }
  g.fillStyle='rgba(70,40,30,0.35)'; g.fillRect(0,0,24,512); // darker top stripe
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,6); t.encoding=THREE.sRGBEncoding; return t;
}
const FUR=furTextures(), TAILTEX=tailTexture();
const KEYS=[[0,0,.40],[.05,.27,.40],[.17,.43,.42],[.40,.45,.43],[.57,.37,.44],[.67,.29,.47],[.76,.275,.49],[.86,.205,.47],[.95,.11,.44],[.985,.05,.43],[1,0,.43]];
function profile(t){
  for(let i=1;i<KEYS.length;i++) if(t<=KEYS[i][0]){ const a=KEYS[i-1], b=KEYS[i]; let u=(t-a[0])/(b[0]-a[0]); u=u*u*(3-2*u); return [a[1]+(b[1]-a[1])*u, a[2]+(b[2]-a[2])*u]; }
  return [0,.43];
}
export function makeRat(isLouise){
  const g=new THREE.Group(), body=new THREE.Group(); g.add(body);
  const base=new THREE.Color(isLouise?0x4a3329:0x3d271f), dark=base.clone().multiplyScalar(0.62);
  const fawn=new THREE.Color(0x9a7563), white=new THREE.Color(0xf3ece4), pinkN=new THREE.Color(0xd9989a);
  const geo=new THREE.SphereGeometry(1,56,40); const pos=geo.attributes.position; const cols=new Float32Array(pos.count*3); const col=new THREE.Color();
  for(let i=0;i<pos.count;i++){
    const s=pos.getY(i), rx=pos.getX(i), rz=pos.getZ(i); const m=Math.hypot(rx,rz)||1;
    const dx=rx/m, dy=-rz/m; const ring=Math.sqrt(Math.max(0,1-s*s));
    const t=(s+1)/2; const [R,cy]=profile(t);
    const yScale = dy>0?0.88:0.72;
    pos.setXYZ(i, dx*R*ring/Math.max(ring,1e-6)*Math.min(1,ring*8)*1.05, cy+dy*R*Math.min(1,ring*8)*yScale, -0.95+t*2.0);
    // colour
    col.copy(base);
    if(dy>0.25) col.lerp(dark,(dy-0.25)*0.9);
    const ang=Math.atan2(dx,-dy);
    if(isLouise){
      const edge=-0.18+0.12*Math.sin(t*26)+0.07*Math.sin(ang*6);
      if(t>0.16&&t<0.7&&dy<edge) col.copy(white); else if(t>0.16&&t<0.7&&dy<edge+0.08) col.lerp(white,0.5);
    } else {
      if(t>0.3&&t<0.66&&dy<-0.72+0.06*Math.sin(t*30)) col.copy(white);
    }
    if(t>0.84){ const k=Math.min(1,(t-0.84)/0.1); col.lerp(fawn,k*(dy<0.3?0.85:0.45)); }
    if(t>0.975) col.lerp(pinkN,Math.min(1,(t-0.975)/0.02));
    cols[i*3]=col.r; cols[i*3+1]=col.g; cols[i*3+2]=col.b;
  }
  geo.setAttribute('color',new THREE.BufferAttribute(cols,3)); geo.computeVertexNormals();
  const furMat=new THREE.MeshStandardMaterial({vertexColors:true,map:FUR.map,bumpMap:FUR.bump,bumpScale:0.025,roughness:0.78});
  body.add(mesh(geo,furMat));
  // ears: big, cupped, pink-beige
  const earOut=new THREE.MeshStandardMaterial({color:0xd8a39b,roughness:0.55,side:THREE.DoubleSide,emissive:0x3a1512,emissiveIntensity:0.35});
  const earIn=new THREE.MeshStandardMaterial({color:0xc98a86,roughness:0.6,side:THREE.DoubleSide});
  const ears=[], eyes=[];
  [-1,1].forEach(s=>{
    const ear=new THREE.Group();
    const cup=mesh(new THREE.SphereGeometry(0.2,20,14,0,Math.PI*2,0,Math.PI*0.55),earOut); cup.scale.set(1,1.15,0.45); ear.add(cup);
    const inner=mesh(new THREE.SphereGeometry(0.17,18,12,0,Math.PI*2,0,Math.PI*0.5),earIn,{cast:false}); inner.scale.set(1,1.12,0.38); inner.position.z=0.015; ear.add(inner);
    ear.rotation.set(-Math.PI/2+0.35,0,0); ear.rotateOnWorldAxis(new THREE.Vector3(0,1,0),-0.55*s); ear.rotateOnWorldAxis(new THREE.Vector3(0,0,1),-0.45*s);
    const earPivot=new THREE.Group(); earPivot.position.set(0.19*s,0.73,0.43); earPivot.add(ear); body.add(earPivot); ears.push(earPivot);
    // eye
    const eye=mesh(new THREE.SphereGeometry(0.058,16,12),new THREE.MeshStandardMaterial({color:0x070405,roughness:0.06,metalness:0.1})); eye.position.set(0.172*s,0.585,0.70); body.add(eye);
    const shine=new THREE.Mesh(new THREE.SphereGeometry(0.014,8,6),new THREE.MeshBasicMaterial({color:0xffffff})); shine.position.set(0.19*s,0.61,0.73); body.add(shine); eyes.push({eye,shine});
  });
  // legs: furry limbs that start inside the body and end in pink paws on the floor,
  // so the feet stay attached. Each leg swings from a hip/shoulder pivot (see animateRat).
  const legMat=new THREE.MeshStandardMaterial({color:base.clone().lerp(fawn,0.3).lerp(white,isLouise?0.1:0.03),map:FUR.map,roughness:0.8});
  const pawMat=new THREE.MeshStandardMaterial({color:0xe2aaa6,roughness:0.6});
  const legs=[];
  // [side x, pivot height, pivot z, floor x, front?]
  [[0.19,0.30,0.30,0.25,true],[0.22,0.26,-0.56,0.29,false]].forEach(([hx,hy,hz,fx,front])=>[-1,1].forEach(s=>{
    const leg=new THREE.Group(); leg.position.set(hx*s,hy,hz); g.add(leg);
    const len=hy-0.04;
    if(!front){ // haunch: the big rounded thigh that blends into the body
      const thigh=mesh(new THREE.SphereGeometry(0.15,16,12),legMat); thigh.scale.set(0.75,1,1.15); thigh.position.set(0,-0.03,0.02); leg.add(thigh); }
    const limb=mesh(new THREE.CylinderGeometry(front?0.065:0.075,0.042,len,10),legMat);
    limb.position.set((fx-hx)*s*0.5,-len/2,front?0.02:-0.03); limb.rotation.z=(fx-hx)*s*1.6; leg.add(limb);
    const paw=new THREE.Group(); paw.position.set((fx-hx)*s,-len,front?0.04:0.0); leg.add(paw);
    const palm=mesh(new THREE.SphereGeometry(0.06,12,8),pawMat); palm.scale.set(1,0.5,front?1.25:1.9); palm.position.z=front?0.03:0.06; paw.add(palm);
    const nToes=front?4:5;
    for(let f=0;f<nToes;f++){ const sp=(f-(nToes-1)/2);
      const toe=mesh(new THREE.CylinderGeometry(0.013,0.011,front?0.075:0.09,5),pawMat); toe.rotation.x=Math.PI/2; toe.rotation.z=sp*0.28;
      toe.position.set(sp*0.026,-0.004,(front?0.1:0.16)+Math.cos(sp*0.6)*0.01); paw.add(toe);
      const tip=mesh(new THREE.SphereGeometry(0.014,6,5),pawMat,{cast:false}); tip.position.set(sp*0.026+Math.sin(sp*0.28)*0.04,-0.004,toe.position.z+0.04); paw.add(tip); }
    // trot: diagonal pairs move together (front-left with back-right)
    legs.push({leg,paw,len,front,phase:(front===(s<0))?0:Math.PI});
  }));
  // whiskers: long, fine, drooping. Each side hangs from a pivot at the nose so it can twitch.
  const whiskMat=new THREE.LineBasicMaterial({color:0xe8e0d8,transparent:true,opacity:0.75}), whiskers=[];
  [-1,1].forEach(s=>{ const wp=[], pv=new THREE.Vector3(0.06*s,0.46,0.93);
    for(let k=0;k<7;k++){ const ox=0.06*s, oy=0.44+(k%3)*0.018, oz=0.93-(k%4)*0.025;
    const ang=-0.35+k*0.12, L=0.55+Math.random()*0.3;
    const mx=ox+Math.cos(ang)*L*0.5*s, mz=oz+Math.sin(ang)*L*0.5+0.1, my=oy+0.02;
    const ex=ox+Math.cos(ang)*L*s, ez=oz+Math.sin(ang)*L+0.12, ey=oy-0.06-k*0.008;
    wp.push(new THREE.Vector3(ox,oy,oz),new THREE.Vector3(mx,my,mz),new THREE.Vector3(mx,my,mz),new THREE.Vector3(ex,ey,ez)); }
    const side=new THREE.Group(); side.position.copy(pv); body.add(side);
    side.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wp.map(p=>p.sub(pv))),whiskMat));
    whiskers.push({g:side,s}); });
  // tail: thick at the base, tapering, scaly
  const tail=new THREE.Group(); tail.position.set(0,0.36,-0.9); g.add(tail);
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,-0.22,-0.45),new THREE.Vector3(0.12,-0.32,-1.0),new THREE.Vector3(0.45,-0.33,-1.55),new THREE.Vector3(0.95,-0.33,-1.85)]);
  const tg=new THREE.TubeGeometry(curve,48,1,8,false); const tp=tg.attributes.position;
  for(let i=0;i<=48;i++){ const c=curve.getPointAt(i/48), r=0.085*(1-i/48)+0.012;
    for(let j=0;j<=8;j++){ const idx=i*9+j; const v=new THREE.Vector3().fromBufferAttribute(tp,idx).sub(c).multiplyScalar(r).add(c); tp.setXYZ(idx,v.x,v.y,v.z); } }
  tg.computeVertexNormals();
  tail.add(mesh(tg,new THREE.MeshStandardMaterial({color:0xc29486,map:TAILTEX,roughness:0.55})));
  g.scale.setScalar(1.1);
  scene.add(g);
  const idle={blinkIn:1+Math.random()*3,blink:-1,ear:[{in:2+Math.random()*4,t:-1},{in:3+Math.random()*4,t:-1}],whisk:-1,whiskIn:1+Math.random()*2,breath:Math.random()*6};
  return {g,body,tail,legs,ears,eyes,whiskers,idle,heading:0,moving:0,stride:0};
}

/* Walk cycle: a quick rat trot. The legs swing from the hip and shoulder, paws lift on the
   way forward and press flat on the way back, and the body bobs twice per stride. */
export function animateRat(r, dt, t, i) {
  const m = r.moving;
  r.stride += dt * (8 + 16 * m);
  const ph = r.stride;
  r.body.position.y = Math.abs(Math.sin(ph)) * 0.045 * m;
  r.body.rotation.x = Math.sin(ph) * 0.035 * m;
  r.tail.rotation.y = Math.sin(t * (m > 0.2 ? 11 : 2.5) + i) * 0.35;
  for (const L of r.legs) {
    const p = ph + L.phase, sw = Math.sin(p), lift = Math.max(0, -Math.cos(p)); // +x rotation swings the paw back, so it moves forward while cos < 0
    const amp = (L.front ? 0.55 : 0.5) * m;
    L.leg.rotation.x = sw * amp;                       // swing forward and back
    L.leg.position.y = L.len + 0.04 + lift * 0.05 * m; // lift the paw on the way forward
    L.paw.rotation.x = -sw * amp - lift * 0.35 * m;    // keep the paw flat, toes up as it lifts
  }
  idleLife(r, dt, 1 - m);
}

/* Little signs of life: blinks, ear flicks, whisker twitches and slow breathing.
   Breathing and the twitches fade out while she runs (still = 1 standing, 0 running). */
const rnd = (a, b) => a + Math.random() * (b - a);
function idleLife(r, dt, still) {
  const s = r.idle;
  // breathing: a slow, gentle swell of the ribs, about 40 breaths a minute when resting
  s.breath += dt * (4.2 + 3 * (1 - still));
  const b = Math.sin(s.breath);
  r.body.scale.set(1 + b * 0.014 * still, 1 + b * 0.02 * still, 1 - b * 0.004 * still);
  r.body.position.y += b * 0.006 * still;
  // blinks: every 2 to 6 seconds, sometimes a double blink
  s.blinkIn -= dt;
  if (s.blinkIn <= 0 && s.blink < 0) { s.blink = 0; s.blinkIn = Math.random() < 0.2 ? 0.35 : rnd(2, 6); }
  let lid = 1;
  if (s.blink >= 0) { s.blink += dt; const k = s.blink / 0.16; lid = k >= 1 ? 1 : Math.abs(1 - 2 * k); if (k >= 1) s.blink = -1; }
  for (const e of r.eyes) { e.eye.scale.y = Math.max(0.1, lid); e.shine.visible = lid > 0.5; }
  // ear flicks: one ear at a time, a quick twitch back and forth
  r.ears.forEach((ear, k) => {
    const E = s.ear[k]; E.in -= dt * (0.4 + still);
    if (E.in <= 0 && E.t < 0) { E.t = 0; E.in = rnd(2.5, 7); }
    let a = 0;
    if (E.t >= 0) { E.t += dt; const k2 = E.t / 0.35; a = k2 >= 1 ? 0 : Math.sin(k2 * Math.PI * 2) * (1 - k2) * 0.4; if (k2 >= 1) E.t = -1; }
    ear.rotation.z = a * (k ? -1 : 1); ear.rotation.x = -Math.abs(a) * 0.4;
  });
  // whiskers: a fast little sniff-and-whisk every second or two, plus a slow drift
  s.whiskIn -= dt;
  if (s.whiskIn <= 0 && s.whisk < 0) { s.whisk = 0; s.whiskIn = rnd(0.8, 3); }
  let w = 0;
  if (s.whisk >= 0) { s.whisk += dt; const k = s.whisk / 0.5; w = k >= 1 ? 0 : Math.sin(k * Math.PI * 4) * (1 - k) * 0.16; if (k >= 1) s.whisk = -1; }
  for (const wh of r.whiskers) { wh.g.rotation.y = -wh.s * (w + Math.sin(s.breath * 0.5) * 0.03) * (0.4 + 0.6 * still); wh.g.rotation.x = w * 0.4; }
}
