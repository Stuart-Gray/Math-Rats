/* The puzzle sheet: story, equation, algebra tiles, vertical working, operation choices,
   answer boxes, hints, calculator and the "check it" line. */
import { $, pick, shuffle } from '../lib/util.js';
import { X, F, plainEq } from '../maths/format.js';
import { CATS, CAT_NAMES, LEVEL_NAMES, makeProblem } from '../maths/generator.js';
import { settings, saveRun as _saveRun, CAT_KEYS } from '../progress/storage.js';
import { levelFor, recordResult } from '../progress/adaptive.js';
import { game, world } from '../game/state.js';
import { ROOMS, PRAISE, SOLVE_LINES } from '../rooms/data.js';
import { sfx } from '../audio/audio.js';
import { say, who } from './speech.js';
import { workStart, workOp, workFill, resEq } from './working.js';
import { toggleCalculator, resetCalculator } from './calculator.js';
import { syncPause, updateHud, showRecipe } from './screens.js';
import { canvas } from '../rooms/world.js';

let cur = null;
export const puzzleOpen = () => !!cur;
export const debugCur = () => cur;
const saveRun = () => _saveRun(game);

function chooseProblem(pz) {
  const en = CAT_KEYS.filter(k => settings.types[k]);
  let cat;
  if (!game.warmDone && en.includes('one') && en.length > 1) cat = 'one';
  else { const w = { one: 1, two: 3, three: 2, both: 2 }, pool = []; en.forEach(k => { for (let i = 0; i < w[k]; i++) pool.push(k); }); cat = pick(pool); }
  game.warmDone = true;
  const lvl = levelFor(cat);
  const ts = CATS[cat].filter(t => t !== 'apar' || lvl >= 2 || cat !== 'two');
  const type = ts.includes(pz.def.pref) && Math.random() < 0.6 ? pz.def.pref : pick(ts);
  return makeProblem(type, lvl, !!pz.def.forceNeg, settings.negatives !== false);
}

export function openPuzzle(pz) {
  if (pz.solved || cur) return;
  if (!pz.data) pz.data = chooseProblem(pz);
  const d = pz.data;
  cur = { pz, d, stage: 'intro', step: 0, hint: 0, wrong: 0, tileStage: 0, t0: performance.now(), opErr: 0, numErr: 0, hints: 0, headMiss: false, calc: 0 };
  $('pKicker').textContent = `${ROOMS[game.level].name} · Puzzle ${world.puzzles.indexOf(pz) + 1} of 3 · ${CAT_NAMES[d.cat]} · ${LEVEL_NAMES[d.lvl]}`;
  $('pTitle').textContent = pz.def.name;
  $('pStory').innerHTML = pz.def.story(d).map(([w, t]) => `<p>${who(w)}<span>${t}</span></p>`).join('');
  $('pEq').innerHTML = d.eq; workStart(d.L); setFb('', '');
  resetCalculator(); toggleCalculator(false);
  renderTiles(); renderControls();
  $('sheet').hidden = false; $('hintBtn').hidden = false; syncPause(); sfx('tap');
  $('sheet').querySelector('.card').scrollTop = 0;
  setTimeout(() => { const b = $('pControls').querySelector('button'); if (b) b.focus({ preventScroll: true }); }, 50);
}
export function closePuzzle() {
  if (!cur) return;
  const wasDone = cur.stage === 'done';
  $('sheet').hidden = true; toggleCalculator(false); cur = null; syncPause(); canvas.focus({ preventScroll: true });
  if (wasDone) afterSolve();
}

function setFb(cls, html) { const f = $('pFeedback'); f.className = 'feedback' + (cls ? ' ' + cls : ''); f.innerHTML = html; }

function renderTiles() {
  const el = $('pTiles'), d = cur.d;
  if (d.type !== 'axpb' || d.x < 1 || d.c > 36) { el.innerHTML = ''; return; }
  const st = cur.tileStage, a = d.a, b = d.b, c = d.c;
  let L = '', R = '';
  for (let i = 0; i < a; i++) L += `<span class="tx${st >= 3 && i > 0 ? ' dim' : ''}">x</span>`;
  if (st < 2) for (let i = 0; i < b; i++) L += `<span class="t1${st === 1 ? ' gone' : ''}"></span>`;
  if (st < 3) { const n = st >= 2 ? c - b : c; for (let i = 0; i < n; i++) R += `<span class="t1${st === 1 && i >= c - b ? ' gone' : ''}"></span>`; }
  else { const per = (c - b) / a; for (let g = 0; g < a; g++) { let t = ''; for (let i = 0; i < per; i++) t += '<span class="t1"></span>'; R += `<span class="grp${g === 0 ? ' hi' : ''}">${t}</span>`; } }
  const cap = st === 0 ? `Each <b>x</b> bar is one mystery bag. Each little square is 1.` : st === 1 ? `Take ${b} squares off <b>both</b> sides. The seesaw stays balanced.` : st === 2 ? `${a} bags balance ${c - b} squares.` : `Split into ${a} equal groups: one bag matches one group.`;
  el.innerHTML = `<div style="display:grid;gap:6px;justify-items:center;width:100%"><div class="tiles"><div class="side">${L}</div><span class="eqsign">=</span><div class="side">${R}</div></div><div class="tiles-cap">${cap}</div></div>`;
}

/* ---------- answer boxes, with clear help for negative numbers ---------- */
const negPossible = () => (cur.d.lvl >= 3 && settings.negatives !== false) || cur.pz.def.forceNeg;
const inputHTML = `<button class="pm" id="pmBtn" type="button" aria-label="Make the number negative or positive">+/−</button><input id="ansInput" inputmode="numeric" autocomplete="off" placeholder="?" aria-label="Your answer">`;
function negTip(expected) {
  if (expected < 0 && !game.negTaught) return `<div class="negtip" role="note">${who('n')}<span><b>Answers can be below zero.</b> To type a negative number, type the number and then tap <b class="pmchip">+/−</b>. You can also type a minus sign first.</span></div>`;
  if (negPossible()) return `<p class="pmhelp">Negative number? Tap <b class="pmchip">+/−</b> to flip the sign.</p>`;
  return '';
}
const answerRow = (lhs, expected) => `<div class="answer"><span class="lhs">${lhs} =</span>${inputHTML}<button class="btn-main" id="ansBtn">Check</button></div>${negTip(expected)}`;
const coefRow = rest => `<div class="answer">${inputHTML}<span class="lhs">${rest}</span><button class="btn-main" id="ansBtn">Check</button></div>`;
function wireAnswer(fn) {
  const inp = $('ansInput');
  const sync = () => { const v = inp.value.trim(); inp.classList.toggle('neg', v.startsWith('-') || v.startsWith('−')); };
  $('pmBtn').addEventListener('click', () => {
    const v = inp.value.trim(); inp.value = v.startsWith('-') || v.startsWith('−') ? v.slice(1) : '-' + v;
    sync(); sfx('pop'); inp.focus();
    inp.classList.remove('flip'); void inp.offsetWidth; inp.classList.add('flip');
  });
  inp.addEventListener('input', sync);
  $('ansBtn').addEventListener('click', () => fn(parseAns(inp.value)));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fn(parseAns(inp.value)); } });
  setTimeout(() => inp.focus({ preventScroll: true }), 60);
}
function parseAns(v) { v = String(v).trim().replace(/[−–—]/g, '-').replace(/\s/g, ''); if (!/^-?\d+$/.test(v)) return null; return parseInt(v, 10); }
const leftOf = r => [r.A, r.B, r.C].filter(Boolean).join(' ');
const signFlipMsg = ans => ans < 0
  ? `So close! You have the right number, but this answer is <b>below zero</b>. Tap <b class="pmchip">+/−</b> to make it negative, then press Check.`
  : `So close! You have the right number, but this answer is <b>positive</b>. Tap <b class="pmchip">+/−</b> to take the minus sign away.`;
const blankMsg = `Type a whole number. For a negative number, tap <b class="pmchip">+/−</b>.`;

function renderControls() {
  const c = $('pControls'), d = cur.d, n = d.steps.length;
  $('calcBtn').hidden = !(settings.calc && (cur.stage === 'op' || cur.stage === 'num'));
  if (cur.stage === 'intro') {
    c.innerHTML = `<p class="prompt">${n === 1 ? 'A quick warm-up! ' : ''}How do you want to tackle it?</p>
      <div class="ops"><button class="op" id="goSteps">Step by step, with Velma and Louise</button>
      <button class="op" id="goHead">I can solve it in my head! <span style="font-weight:400;font-size:14px">(+5 bonus cheese)</span></button></div>`;
    $('goSteps').onclick = () => { cur.stage = 'op'; setFb('', ''); renderControls(); };
    $('goHead').onclick = () => { cur.stage = 'head'; setFb('', ''); renderControls(); };
  } else if (cur.stage === 'head') {
    c.innerHTML = `<p class="prompt">Speedy Velma mode: work it out in your head.</p>${answerRow(X, d.x)}
      <button class="linkish" id="toSteps">Actually, let's do it step by step</button>`;
    wireAnswer(v => {
      if (v === null) { setFb('oops', blankMsg); return; }
      if (v === d.x) { if (d.x < 0) game.negTaught = true; solved(true); }
      else if (v === -d.x && d.x !== 0) { cur.numErr++; sfx('oops'); setFb('oops', `${who('l')} ${signFlipMsg(d.x)}`); $('ansInput').focus(); }
      else { cur.headMiss = true; sfx('oops'); setFb('oops', `${who('v')} Hmm, not quite! No worries, let's work through it together.`); cur.stage = 'op'; renderControls(); }
    });
    $('toSteps').onclick = () => { cur.stage = 'op'; setFb('', ''); renderControls(); };
  } else if (cur.stage === 'op') {
    const s = d.steps[cur.step];
    c.innerHTML = `<p class="prompt">${s.prompt}</p><div class="ops">${shuffle(s.ops).map(o => `<button class="op" data-ok="${o.ok ? 1 : 0}" data-fb="${encodeURIComponent(o.fb || '')}">${o.label}</button>`).join('')}</div>`;
    c.querySelectorAll('.op').forEach(btn => btn.addEventListener('click', () => {
      if (btn.dataset.ok === '1') {
        cur.hint = 0; cur.wrong = 0; sfx('step');
        workOp(d.L, cur.step);
        cur.tileStage = cur.step === 0 ? 1 : 3; renderTiles();
        setFb('good', `${who('l')} Yes! ${d.L.ops[cur.step].msg}${s.coef ? '' : ' Now work out the new number in the box.'}`);
        cur.stage = 'num'; renderControls();
      } else {
        cur.opErr++; sfx('oops');
        btn.classList.add('no'); btn.disabled = true;
        setFb('oops', `${who('l')} ${decodeURIComponent(btn.dataset.fb)}`);
      }
    }));
  } else if (cur.stage === 'num') {
    const s = d.steps[cur.step], r = d.L.res[cur.step];
    if (s.coef) { const f = h => h ? h.replace('{Q}', '') : ''; c.innerHTML = `<p class="prompt">How many ${X}'s are left on the left side?</p>${coefRow(`${[f(r.A), f(r.B), f(r.C)].filter(Boolean).join(' ')} = ${[r.D, r.E].filter(Boolean).join(' ')}`)}`; }
    else c.innerHTML = `<p class="prompt">Work it out:</p>${answerRow(leftOf(r), s.ans)}`;
    wireAnswer(v => {
      if (v === null) { setFb('oops', blankMsg); return; }
      if (v === s.ans) {
        if (s.ans < 0) game.negTaught = true;
        workFill(cur.step, s.ans);
        $('pEq').innerHTML = resEq(d.L, cur.step, s.ans);
        cur.hint = 0; cur.wrong = 0;
        if (cur.step < n - 1) {
          cur.step++; cur.stage = 'op'; if (cur.step === 1) { cur.tileStage = 2; renderTiles(); } sfx('step');
          setFb('good', `${who('v')} ${pick(['Nice mental math!', 'Crumb-perfect!', 'Correct!', 'Squeaky clean!'])} ${n - cur.step === 1 ? 'One more step.' : `${n - cur.step} steps to go.`}`); renderControls();
        } else solved(false);
      } else {
        cur.wrong++; cur.numErr++; sfx('oops');
        if (v === -s.ans && s.ans !== 0) setFb('oops', `${who('l')} ${signFlipMsg(s.ans)}`);
        else { const h = s.numHints[Math.min(cur.wrong - 1, s.numHints.length - 1)]; setFb('oops', `${who('v')} Not quite. ${h}`); }
        $('ansInput').select();
      }
    });
  } else if (cur.stage === 'done') {
    c.innerHTML = `<div class="check">Check: ${d.check} <b>✓</b></div>
      <div class="reward">+${cur.reward} cheese${cur.headBonus ? ' · Speedy Velma bonus!' : ''}</div>
      <button class="btn-main" id="backBtn">Back to exploring</button>`;
    $('backBtn').onclick = closePuzzle;
    setTimeout(() => $('backBtn').focus({ preventScroll: true }), 60);
  }
}

export function setupPuzzle() {
  $('pClose').addEventListener('click', closePuzzle);
  $('pRecipe').addEventListener('click', showRecipe);
  $('calcBtn').addEventListener('click', () => toggleCalculator(undefined, () => { if (cur && !cur.calcCounted) { cur.calc = 1; cur.calcCounted = true; } }));
  $('hintBtn').addEventListener('click', () => {
    if (!cur) return; const d = cur.d;
    let list;
    if (cur.stage === 'intro' || cur.stage === 'head') list = [`Undo the adding or subtracting first, then the multiplying or dividing. With brackets, work from the outside in.`, `Try it: ${d.steps.map(s => plainEq(s.ops.find(o => o.ok).label).toLowerCase()).join(', then ')}.`];
    else if (cur.stage === 'op') list = d.steps[cur.step].opHints;
    else if (cur.stage === 'num') {
      list = d.steps[cur.step].numHints.slice();
      if (settings.calc) list.push(`Still stuck? Open the calculator to check your thinking, then type your answer.`);
    }
    else return;
    setFb('hint', `${who('l')} ${list[Math.min(cur.hint, list.length - 1)]}`);
    cur.hint++; cur.hints++;
  });
}

function solved(head) {
  const d = cur.d; cur.stage = 'done';
  cur.reward = head ? d.steps.length + 5 : d.steps.length + 1; cur.headBonus = head;
  if (head) { game.head++; $('pEq').innerHTML = `${X} = ${F(d.x)}`; workStart(d.L); d.steps.forEach((s, i) => { workOp(d.L, i, true); workFill(i, s.ans); }); }
  game.cheese += cur.reward;
  cur.tileStage = 3; renderTiles();
  setFb('good', `${who(pick(['v', 'l']))} <b>${pick(PRAISE)}</b> ${X} = ${F(d.x)}. Let's always check by putting it back in:`);
  cur.pz.solved = true; game.solved++;
  game.lastLv = { dir: recordResult({ d, sec: (performance.now() - cur.t0) / 1000, opErr: cur.opErr, numErr: cur.numErr, hints: cur.hints, headMiss: cur.headMiss, head, calc: cur.calc }), cat: d.cat };
  cur.pz.ring.material.color.set(0x7fc79a); cur.pz.gem.visible = false;
  cur.pz.lastSolved = performance.now();
  $('hintBtn').hidden = true; toggleCalculator(false); sfx('good');
  updateHud(); saveRun(); renderControls();
}

function afterSolve() {
  const last = world.puzzles.filter(p => p.solved).sort((a, b) => (a.lastSolved || 0) - (b.lastSolved || 0)).slice(-1)[0];
  if (last && SOLVE_LINES[last.def.id]) SOLVE_LINES[last.def.id].forEach(l => say(l[0], l[1]));
  if (last && last.def.id === 'tub') sfx('squeak');
  const lv = game.lastLv;
  if (lv && lv.dir === 'up') { sfx('level'); say('l', `Level up on ${CAT_NAMES[lv.cat].toLowerCase()} puzzles! The numbers get a little bigger now.`); }
  if (lv && lv.dir === 'down') say('v', `Let's make the next ${CAT_NAMES[lv.cat].toLowerCase()} puzzles a bit friendlier. Warm-up time!`);
  game.lastLv = null;
  const door = world.door;
  if (game.solved >= 3 && !door.open) {
    door.open = true;
    setTimeout(() => { sfx('door'); say('n', game.level < ROOMS.length - 1 ? 'All three solved! The mouse hole on the back wall is glowing. Tap it (or tap “Show me the way”) to head through.' : 'All three solved! The last mouse hole leads to the snack stash!'); }, 600);
  }
}
