/* The vertical working, laid out like on paper: the equation on top, each opposite operation
   directly under the term it undoes on both sides, a slash through each cancelling pair,
   a rule line, then the new equation with a box for the answer. */
import { $ } from '../lib/util.js';
import { F, Q } from '../maths/format.js';
import { sfx } from '../audio/audio.js';

function workRow(lab, r, eqSign, cls) {
  const k = cls ? ` ${cls}` : '', c = v => v || '';
  $('pWork').insertAdjacentHTML('beforeend', `<span class="lab">${lab}</span><span class="cA${k}">${c(r.A)}</span><span class="cB${k}">${c(r.B)}</span><span class="cB${k}">${c(r.C)}</span><span class="cE">${eqSign || ''}</span><span class="cD${k}">${c(r.D)}</span><span class="cB${k}">${c(r.E)}</span>`);
}
function workRule() { $('pWork').insertAdjacentHTML('beforeend', '<span class="lab" style="min-height:0"></span><span class="rule"></span>'); }
const wrapOp = h => h ? `<span class="opr">${h}</span>` : '';

export function workStart(L) { $('pWork').innerHTML = ''; workRow('Start', L.start, '='); }
export function workOp(L, i, quiet) {
  const o = L.ops[i], r = L.res[i];
  workRow(`Step ${i + 1}`, { A: wrapOp(o.A), B: wrapOp(o.B), C: wrapOp(o.C), D: wrapOp(o.D), E: wrapOp(o.E) }, '');
  setTimeout(() => { $('pWork').querySelectorAll(`.cn[data-k="s${i}"]`).forEach(el => el.classList.add('x')); if (!quiet) sfx('slash'); }, 200);
  workRule();
  const fill = v => v ? v.replace(Q, `<span class="q" id="q${i}">?</span>`) : v;
  workRow('', { A: fill(r.A), B: fill(r.B), C: fill(r.C), D: fill(r.D), E: fill(r.E) }, '=');
}
export function workFill(i, v) { const q = $('q' + i); if (q) { q.textContent = F(v); q.classList.add('filled'); } }
export function resEq(L, i, v) {
  const r = L.res[i], f = h => h ? h.replace(Q, F(v)) : '';
  return `${[f(r.A), f(r.B), f(r.C)].filter(Boolean).join(' ')} = ${[f(r.D), f(r.E)].filter(Boolean).join(' ')}`;
}
