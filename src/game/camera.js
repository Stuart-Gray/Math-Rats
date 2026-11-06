/* Where the gameplay camera wants to be for a given Velma position. Shared by the game loop
   and the cutscenes, so a cutscene can end exactly on the gameplay view. */
import { W, D, camera } from '../rooms/world.js';

export function gameCam(vp, pos, look) {
  const portrait = camera.aspect < 0.8;
  const off = portrait ? [5, 15, 14] : [6.5, 11.5, 12.5];
  // keep the room filling the screen: the view drifts with the rats but stops short of the edges
  look.set(Math.max(-W / 2 + 6, Math.min(W / 2 - 6, vp.x * 0.85)), 1.2, Math.max(-D / 2 + 3, Math.min(D / 2 - 3.5, vp.z * 0.8)) + (portrait ? -1 : 0));
  pos.set(look.x + off[0], off[1], look.z + off[2]);
}
