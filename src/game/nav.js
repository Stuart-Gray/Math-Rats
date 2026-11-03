/* Tap-to-walk pathfinding. The room floor is a grid; A* finds a way around furniture,
   then the path is smoothed so the rats run in straight lines where they can. */
import { W, D } from '../rooms/world.js';
import { world } from './state.js';

const CELL = 0.25, R = 0.6;
const NX = Math.round(W / CELL), NZ = Math.round(D / CELL);
let blocked = new Uint8Array(NX * NZ);
const cx = i => -W / 2 + (i + 0.5) * CELL, cz = j => -D / 2 + (j + 0.5) * CELL;
const ci = x => Math.max(0, Math.min(NX - 1, Math.floor((x + W / 2) / CELL)));
const cj = z => Math.max(0, Math.min(NZ - 1, Math.floor((z + D / 2) / CELL)));

function hit(x, z) {
  if (x < -W / 2 + 0.7 || x > W / 2 - 0.7 || z < -D / 2 + 0.7 || z > D / 2 - 0.7) return true;
  for (const c of world.cols) {
    const dx = Math.max(Math.abs(x - c.x) - c.w / 2, 0), dz = Math.max(Math.abs(z - c.z) - c.d / 2, 0);
    if (dx * dx + dz * dz < R * R) return true;
  }
  return false;
}
/* Call after a room is built. */
export function buildNav() {
  blocked = new Uint8Array(NX * NZ);
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) blocked[j * NX + i] = hit(cx(i), cz(j)) ? 1 : 0;
}
function nearestFree(i, j) {
  if (!blocked[j * NX + i]) return [i, j];
  for (let r = 1; r < 40; r++) {
    let best = null, bd = 1e9;
    for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
      const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= NX || b >= NZ || blocked[b * NX + a]) continue;
      const d = di * di + dj * dj; if (d < bd) { bd = d; best = [a, b]; }
    }
    if (best) return best;
  }
  return [i, j];
}
function clearLine(x0, z0, x1, z1) {
  const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / (CELL * 0.5));
  for (let k = 1; k <= n; k++) { const t = k / n; if (blocked[cj(z0 + (z1 - z0) * t) * NX + ci(x0 + (x1 - x0) * t)]) return false; }
  return true;
}
/* Returns a list of {x, z} waypoints from (x0, z0) toward (x1, z1), ending at the nearest reachable spot. */
export function findPath(x0, z0, x1, z1) {
  const [si, sj] = nearestFree(ci(x0), cj(z0)), [gi, gj] = nearestFree(ci(x1), cj(z1));
  const goalFree = !blocked[cj(z1) * NX + ci(x1)];
  const end = goalFree ? { x: x1, z: z1 } : { x: cx(gi), z: cz(gj) };
  if (clearLine(x0, z0, end.x, end.z)) return [end];
  const N = NX * NZ, g = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
  const open = [], start = sj * NX + si, goal = gj * NX + gi;
  const h = k => Math.hypot((k % NX) - gi, Math.floor(k / NX) - gj);
  g[start] = 0; open.push([h(start), start]);
  let found = false, guard = 0;
  while (open.length && guard++ < 20000) {
    let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
    const [, cur] = open[bi]; open[bi] = open[open.length - 1]; open.pop();
    if (closed[cur]) continue; closed[cur] = 1;
    if (cur === goal) { found = true; break; }
    const i = cur % NX, j = Math.floor(cur / NX);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue; const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= NX || b >= NZ) continue; const nk = b * NX + a;
      if (blocked[nk] || closed[nk]) continue;
      if (di && dj && (blocked[j * NX + a] || blocked[b * NX + i])) continue; // no corner cutting
      const ng = g[cur] + (di && dj ? 1.4142 : 1);
      if (ng < g[nk]) { g[nk] = ng; from[nk] = cur; open.push([ng + h(nk), nk]); }
    }
  }
  if (!found) return [end];
  const cells = []; for (let k = goal; k !== -1; k = from[k]) cells.push({ x: cx(k % NX), z: cz(Math.floor(k / NX)) });
  cells.reverse(); cells[cells.length - 1] = end;
  // string-pulling: skip waypoints we can see past
  const out = []; let ax = x0, az = z0, k = 0;
  while (k < cells.length) {
    let far = k; for (let m = cells.length - 1; m > k; m--) if (clearLine(ax, az, cells[m].x, cells[m].z)) { far = m; break; }
    out.push(cells[far]); ax = cells[far].x; az = cells[far].z; k = far + 1;
  }
  return out;
}
