/* Sir Whiskerton, the sleeping cat in the living room. */
import { THREE } from '../lib/three.js';
import { room, mesh, mat, addCol } from '../rooms/world.js';
import { world } from '../game/state.js';

export function makeCat(x,z){
  const g=new THREE.Group(); const orange=mat(0xd98b3e,{roughness:1}); const cream=mat(0xf3d6ad,{roughness:1});
  const b=mesh(new THREE.SphereGeometry(1,24,16),orange); b.scale.set(1.5,0.62,1.05); b.position.y=0.62; g.add(b);
  const head=mesh(new THREE.SphereGeometry(0.62,20,14),orange); head.position.set(1.25,0.62,0.55); g.add(head);
  const muzzle=mesh(new THREE.SphereGeometry(0.3,14,10),cream); muzzle.scale.set(1,0.7,0.8); muzzle.position.set(1.62,0.5,0.82); g.add(muzzle);
  [-1,1].forEach(s=>{ const ear=mesh(new THREE.ConeGeometry(0.22,0.4,4),orange); ear.position.set(1.15+0.28*s,1.15,0.45); ear.rotation.z=-0.25*s; g.add(ear);
    const lid=mesh(new THREE.BoxGeometry(0.2,0.04,0.04),mat(0x2a1a14)); lid.position.set(1.5+0.05*s,0.72,1.0+0.18*s*0); lid.position.x=1.45; lid.position.z=0.75+0.25*s; lid.rotation.y=Math.PI/2; g.add(lid); });
  const collar=mesh(new THREE.TorusGeometry(0.5,0.06,8,20),mat(0x3f6fb0)); collar.position.set(0.95,0.55,0.45); collar.rotation.y=Math.PI/2; g.add(collar);
  const tag=mesh(new THREE.CylinderGeometry(0.13,0.13,0.04,16),mat(0xf2c14e,{metalness:0.6,roughness:0.3})); tag.rotation.x=Math.PI/2; tag.position.set(1.0,0.35,1.0); g.add(tag);
  const tl=mesh(new THREE.TorusGeometry(1.25,0.16,8,24,Math.PI*1.1),orange); tl.rotation.x=Math.PI/2; tl.position.set(-0.2,0.18,0.1); g.add(tl);
  g.position.set(x,0,z); g.rotation.y=-0.3; room.add(g); addCol(x,z-0.1,3.4,2.4);
  world.catZs=[0,1,2].map(i=>{ const c=document.createElement('canvas'); c.width=c.height=64; const k=c.getContext('2d'); k.fillStyle='#fff4df'; k.font='bold 52px Grandstander, sans-serif'; k.textAlign='center'; k.fillText('z',32,50);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true})); s.scale.set(0.5,0.5,0.5); room.add(s); return {s,phase:i/3,x:x+1.3,z:z+0.5}; });
}
