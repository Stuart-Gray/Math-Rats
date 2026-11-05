/* Everything saved in the browser. Never rename these keys or saved progress is lost:
   vl-house-of-x-v1 (current run), vl-house-of-x-settings, vl-house-of-x-stats. */
export const SAVE_KEY = 'vl-house-of-x-v1';
export const SET_KEY = 'vl-house-of-x-settings';
export const STAT_KEY = 'vl-house-of-x-stats';
export const CAT_KEYS = ['one', 'two', 'three', 'both'];

export function loadJSON(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
export function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: play on without saving */ } }

/* ---------- settings ---------- */
export const DEFAULTS = {
  music: true, sfx: true, vol: 0.5,
  types: { one: true, two: true, three: false, both: false },
  adaptive: true, level: 2,
  calc: true,          // on-screen calculator in step-by-step mode
  negatives: true,     // include negative integers at Hard and Expert (Easy/Medium never use them)
  talk: 1,             // how long speech bubbles stay: 1 normal, 1.7 longer, 0 = until closed
  lastSong: -1,        // so the next run picks a different tune
};
export const settings = Object.assign({}, DEFAULTS, loadJSON(SET_KEY) || {});
settings.types = Object.assign({}, DEFAULTS.types, settings.types || {});
export const saveSettings = () => saveJSON(SET_KEY, settings);

/* ---------- grown-ups' stats ---------- */
const blankCat = () => ({ n: 0, clean: 0, time: 0, hints: 0, opErr: 0, numErr: 0, head: 0, calc: 0 });
export const stats = loadJSON(STAT_KEY) || {};
export function normStats() {
  stats.cats = stats.cats || {}; stats.skill = stats.skill || {}; stats.streak = stats.streak || {}; stats.history = stats.history || [];
  CAT_KEYS.forEach(k => {
    stats.cats[k] = Object.assign(blankCat(), stats.cats[k] || {});
    if (!stats.skill[k]) stats.skill[k] = 1;
    if (stats.streak[k] == null) stats.streak[k] = 0;
  });
}
normStats();
export const saveStats = () => saveJSON(STAT_KEY, stats);
export function resetStats() { Object.keys(stats).forEach(k => delete stats[k]); normStats(); saveStats(); }

/* ---------- the current run ---------- */
// Version 5 added the Bathroom as room 3, so the attic moved from index 2 to 3.
// Saves without `rooms` come from the 3-room version.
export const ROOM_COUNT = 4;
export function loadRun() {
  const s = loadJSON(SAVE_KEY);
  if (!s || typeof s.level !== 'number') return null;
  if (!s.rooms && s.level === 2) s.level = 3;
  s.jokes = Array.isArray(s.jokes) ? s.jokes : [];
  return s;
}
export function saveRun(game) {
  saveJSON(SAVE_KEY, { level: game.level, cheese: game.cheese, head: game.head, rooms: ROOM_COUNT, jokes: game.jokesFound });
}
export function clearRun() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }
