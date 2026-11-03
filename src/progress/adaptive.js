/* Adaptive difficulty: each puzzle type has its own level.
   Two quick, clean solves in a row move it up; a puzzle with 2+ slips or hints moves it down. */
import { settings, stats, saveStats } from './storage.js';
import { plainEq } from '../maths/format.js';

export const levelFor = cat => settings.adaptive ? stats.skill[cat] : settings.level;
const QUICK_SECONDS = { one: 40, two: 80, three: 120, both: 130 };

/* r: {d, sec, opErr, numErr, hints, headMiss, head, calc}. Returns 'up', 'down' or null. */
export function recordResult(r) {
  const { d } = r, cat = d.cat;
  const clean = r.opErr === 0 && r.numErr === 0 && r.hints === 0 && !r.headMiss;
  const st = stats.cats[cat];
  st.n++; if (clean) st.clean++; st.time += r.sec; st.hints += r.hints; st.opErr += r.opErr; st.numErr += r.numErr;
  if (r.head) st.head++; if (r.calc) st.calc++;
  stats.history.unshift({ at: Date.now(), cat, eq: plainEq(d.eq), sec: Math.round(r.sec), opErr: r.opErr, numErr: r.numErr, hints: r.hints, head: r.head, lvl: d.lvl, calc: r.calc || 0 });
  stats.history = stats.history.slice(0, 30);
  let lv = null;
  if (settings.adaptive) {
    const quick = r.sec < QUICK_SECONDS[cat];
    const struggle = r.opErr + r.numErr + (r.headMiss ? 1 : 0) >= 2 || r.hints >= 2;
    if (clean && quick) { stats.streak[cat]++; if (stats.streak[cat] >= 2 && stats.skill[cat] < 4) { stats.skill[cat]++; stats.streak[cat] = 0; lv = 'up'; } }
    else { stats.streak[cat] = 0; if (struggle && stats.skill[cat] > 1) { stats.skill[cat]--; lv = 'down'; } }
  }
  saveStats();
  return lv;
}
