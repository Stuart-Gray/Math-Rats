/* Menus and overlays: HUD, recipe card, settings, joke book and the grown-ups' progress report. */
import { $ } from '../lib/util.js';
import { CAT_NAMES, LEVEL_NAMES } from '../maths/generator.js';
import { settings, saveSettings, stats, resetStats, CAT_KEYS } from '../progress/storage.js';
import { game, world } from '../game/state.js';
import { audio, sfx } from '../audio/audio.js';

const OVERLAYS = ['titleScreen', 'sheet', 'recipe', 'settings', 'parent', 'victory', 'jokebook'];
export function syncPause() { game.paused = !game.started || !!game.transition || OVERLAYS.some(id => !$(id).hidden); }
/* The topmost open menu: overlays that can sit on top of the puzzle sheet are checked first,
   so Escape closes the recipe card and returns to the puzzle. */
const TOP_FIRST = ['recipe', 'settings', 'parent', 'jokebook', 'sheet'];
export const anyOverlay = () => TOP_FIRST.find(id => !$(id).hidden);
export const topOverlay = () => ['victory', ...TOP_FIRST, 'titleScreen'].find(id => !$(id).hidden);

export function updateHud() {
  const d = $('dots'); d.innerHTML = '';
  world.puzzles.forEach(p => { const s = document.createElement('span'); s.className = 'dot' + (p.solved ? ' on' : ''); d.appendChild(s); });
  const t = document.createElement('span'); t.textContent = game.solved >= 3 ? 'Mouse hole open!' : `${game.solved}/3 solved`; d.appendChild(t);
  $('cheeseN').textContent = game.cheese;
}

/* ---------- recipe card ---------- */
export function showRecipe() { $('recipe').hidden = false; syncPause(); $('recipeClose').focus(); }
export function hideRecipe() { $('recipe').hidden = true; syncPause(); }

/* ---------- joke book ---------- */
export function openJokes() {
  const list = game.jokesFound;
  $('jokeList').innerHTML = list.length
    ? list.map(j => `<li>${j}</li>`).join('')
    : '<li class="muted">No jokes yet. Collect the glowing cheese crumbs to find them!</li>';
  $('jokeCount').textContent = `${list.length} found this run`;
  $('jokebook').hidden = false; syncPause(); $('jokeClose').focus();
}
export function closeJokes() { $('jokebook').hidden = true; syncPause(); }

/* ---------- settings ---------- */
const TYPE_IDS = { one: 'tOne', two: 'tTwo', three: 'tThree', both: 'tBoth' };
let snapshot = '';
const snap = () => JSON.stringify({ t: settings.types, a: settings.adaptive, l: settings.level });
export function openSettings() {
  $('setMusic').checked = settings.music; $('setSfx').checked = settings.sfx; $('setVol').value = settings.vol;
  $('setCalc').checked = settings.calc;
  CAT_KEYS.forEach(k => $(TYPE_IDS[k]).checked = settings.types[k]);
  $('setAdaptive').checked = settings.adaptive; renderSegs(); $('typeNote').textContent = '';
  $('songName').textContent = audio.song ? `Now playing: “${audio.song.name}”` : '';
  snapshot = snap();
  $('settings').hidden = false; syncPause(); $('setDone').focus();
}
export function closeSettings() {
  saveSettings(); $('settings').hidden = true; syncPause();
  if (snap() !== snapshot) world.puzzles.forEach(p => { if (!p.solved) p.data = null; });
}
function renderSegs() {
  const seg = $('levelSeg'); seg.hidden = settings.adaptive;
  seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.l === settings.level)));
  $('talkSeg').querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.t === settings.talk)));
}

/* ---------- grown-ups' progress report ---------- */
let holdT = null;
export function openParent() { $('parentLock').hidden = false; $('parentBody').hidden = true; $('parent').hidden = false; syncPause(); }
export function closeParent() { $('parent').hidden = true; syncPause(); }
function fmtTime(s) { s = Math.round(s); return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`; }
function renderParent() {
  const C = stats.cats; const sum = f => CAT_KEYS.reduce((t, k) => t + C[k][f], 0);
  const total = sum('n'), clean = sum('clean'), head = sum('head');
  let tricky = '';
  if (total) {
    const op = sum('opErr'), nm = sum('numErr');
    tricky = op === 0 && nm === 0 ? 'No slip-ups recorded yet.' : op > nm * 1.3 ? 'Most slip-ups happen when choosing which operation to undo. The recipe card and the “undo in reverse order” idea are worth practising together.' : nm > op * 1.3 ? 'She usually picks the right step. Most slip-ups are in the mental arithmetic, so quick number practice will pay off.' : 'Slip-ups are split between choosing the step and the arithmetic.';
  }
  const rows = CAT_KEYS.map(k => { const s = C[k]; const on = settings.types[k];
    if (!s.n) return `<tr><th scope="row">${CAT_NAMES[k]}${on ? '' : ' <span class="off">off</span>'}</th><td>${LEVEL_NAMES[stats.skill[k]]}</td><td colspan="6" class="muted">Not tried yet</td></tr>`;
    const spot = s.opErr === 0 && s.numErr === 0 ? 'Smooth so far' : s.opErr > s.numErr ? 'Choosing the step' : s.numErr > s.opErr ? 'Mental arithmetic' : 'A bit of both';
    const pct = Math.round(100 * s.clean / s.n);
    return `<tr><th scope="row">${CAT_NAMES[k]}${on ? '' : ' <span class="off">off</span>'}</th><td>${LEVEL_NAMES[stats.skill[k]]}</td><td>${s.n}</td><td><span class="bar"><span style="width:${pct}%"></span></span>${pct}%</td><td>${fmtTime(s.time / s.n)}</td><td>${(s.hints / s.n).toFixed(1)}</td><td>${Math.round(100 * (s.calc || 0) / s.n)}%</td><td>${spot}</td></tr>`; }).join('');
  const hist = stats.history.slice(0, 12).map(h => { const ok = !h.opErr && !h.numErr && !h.hints;
    return `<li><span class="eqp">${h.eq}</span><span class="muted">${CAT_NAMES[h.cat]} · ${LEVEL_NAMES[h.lvl]} · ${fmtTime(h.sec)}${h.head ? ' · in her head' : ''}${h.calc ? ' · used calculator' : ''}</span><span class="pill ${ok ? 'ok' : 'meh'}">${ok ? 'First try' : `${h.opErr + h.numErr} slip${h.opErr + h.numErr === 1 ? '' : 's'}${h.hints ? `, ${h.hints} hint${h.hints > 1 ? 's' : ''}` : ''}`}</span></li>`; }).join('');
  $('parentBody').innerHTML = `
    <div class="stats">
      <div class="stat"><span class="k">Puzzles solved</span><b>${total}</b></div>
      <div class="stat"><span class="k">First try, no hints</span><b>${total ? Math.round(100 * clean / total) + '%' : '—'}</b></div>
      <div class="stat"><span class="k">Solved in her head</span><b>${head}</b></div>
    </div>
    ${total ? `<p class="note-p">${tricky}</p>` : '<p class="note-p">Nothing recorded yet. Results appear here after the first puzzle.</p>'}
    <div class="tablewrap"><table class="ptable">
      <thead><tr><th>Type</th><th>Level</th><th>Solved</th><th>First try</th><th>Avg time</th><th>Hints each</th><th>Used calculator</th><th>Trickiest part</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <p class="muted small">“First try” means no wrong steps, no wrong answers and no hints. Using the calculator doesn't count as a slip. Levels change on their own when adaptive difficulty is on: up after two quick, clean solves in a row, down after a puzzle with two or more slips or hints.</p>
    ${hist ? `<h3 class="h3">Recent puzzles</h3><ul class="hist">${hist}</ul>` : ''}
    <div class="row" id="resetRow"><button class="btn-ghost" id="resetBtn">Reset progress</button></div>`;
  $('resetBtn').onclick = () => {
    $('resetRow').innerHTML = `<span>Erase all progress and levels?</span><button class="btn-main" id="resetYes">Yes, reset</button><button class="btn-ghost" id="resetNo">Keep it</button>`;
    $('resetYes').onclick = () => { resetStats(); renderParent(); };
    $('resetNo').onclick = renderParent;
  };
}

export function setupScreens() {
  $('recipeBtn').addEventListener('click', showRecipe); $('recipeClose').addEventListener('click', hideRecipe);
  $('cheeseBtn').addEventListener('click', openJokes); $('jokeClose').addEventListener('click', closeJokes);
  $('setMusic').addEventListener('change', e => { settings.music = e.target.checked; audio.init(); audio.apply(); });
  $('setSfx').addEventListener('change', e => { settings.sfx = e.target.checked; audio.init(); audio.apply(); sfx('tap'); });
  $('setVol').addEventListener('input', e => { settings.vol = +e.target.value; audio.init(); audio.apply(); });
  $('setCalc').addEventListener('change', e => { settings.calc = e.target.checked; });
  $('newSong').addEventListener('click', () => { audio.init(); const n = audio.newSong(); $('songName').textContent = `Now playing: “${n}”`; sfx('tap'); });
  CAT_KEYS.forEach(k => $(TYPE_IDS[k]).addEventListener('change', e => {
    if (!e.target.checked && CAT_KEYS.filter(j => settings.types[j]).length === 1) { e.target.checked = true; $('typeNote').textContent = 'Keep at least one problem type switched on.'; return; }
    settings.types[k] = e.target.checked; $('typeNote').textContent = '';
  }));
  $('setAdaptive').addEventListener('change', e => { settings.adaptive = e.target.checked; renderSegs(); });
  $('levelSeg').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { settings.level = +b.dataset.l; renderSegs(); }));
  $('talkSeg').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { settings.talk = +b.dataset.t; renderSegs(); }));
  $('setDone').addEventListener('click', closeSettings);
  $('settingsBtn').addEventListener('click', openSettings); $('titleSettings').addEventListener('click', openSettings);
  const holdBtn = $('holdBtn');
  const holdStart = e => { e.preventDefault(); holdBtn.classList.add('holding'); holdT = setTimeout(() => { holdBtn.classList.remove('holding'); renderParent(); $('parentLock').hidden = true; $('parentBody').hidden = false; }, 2000); };
  const holdEnd = () => { holdBtn.classList.remove('holding'); clearTimeout(holdT); };
  holdBtn.addEventListener('pointerdown', holdStart); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => holdBtn.addEventListener(ev, holdEnd));
  holdBtn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) holdStart(e); });
  holdBtn.addEventListener('keyup', holdEnd);
  $('parentClose').addEventListener('click', closeParent); $('titleParent').addEventListener('click', openParent);
}
