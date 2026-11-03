/* Louise's pocket calculator: an optional on-screen calculator in step-by-step mode,
   for checking mental math before pressing Check. Works left to right like a simple
   calculator, and handles negative numbers with the +/− key. */
import { $ } from '../lib/util.js';
import { F } from '../maths/format.js';
import { sfx } from '../audio/audio.js';

const KEYS = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '±', '0', '=', '+', 'C', '⌫'];
let acc = null, op = null, entry = '', last = '', fresh = false;
let onUse = () => {};

const num = s => (s === '' || s === '-' ? 0 : Number(s));
const show = v => {
  if (!Number.isFinite(v)) return 'Oops';
  const r = Math.round(v * 10000) / 10000;
  return F(r);
};
function calc(a, o, b) {
  if (o === '+') return a + b; if (o === '−') return a - b; if (o === '×') return a * b;
  if (o === '÷') return b === 0 ? NaN : a / b; return b;
}
function render() {
  const e = entry === '' ? (acc === null ? '0' : '') : entry.replace('-', '−');
  $('calcExpr').textContent = acc === null ? last : `${show(acc)} ${op || ''}`;
  $('calcOut').textContent = e || show(acc);
}
function press(k) {
  sfx('key'); onUse();
  if (/\d/.test(k)) { if (fresh) { entry = ''; fresh = false; } if (entry.replace('-', '').length < 7) entry = (entry === '0' ? '' : entry === '-0' ? '-' : entry) + k; }
  else if (k === '±') { if (fresh) { entry = String(num(entry)); fresh = false; } entry = entry.startsWith('-') ? entry.slice(1) : '-' + entry; }
  else if (k === '⌫') { if (!fresh) entry = entry.slice(0, -1); }
  else if (k === 'C') { acc = null; op = null; entry = ''; last = ''; fresh = false; }
  else if (k === '=') {
    if (op !== null && acc !== null) {
      const b = num(entry), r = calc(acc, op, b);
      last = `${show(acc)} ${op} ${show(b)} =`;
      if (!Number.isFinite(r)) { $('calcExpr').textContent = 'Nobody can share into 0 piles!'; acc = null; op = null; entry = ''; $('calcOut').textContent = 'Oops'; return; }
      entry = String(Math.round(r * 10000) / 10000); acc = null; op = null; fresh = true;
    }
  } else { // + − × ÷
    if (acc !== null && op !== null && entry !== '' && !fresh) { const r = calc(acc, op, num(entry)); acc = Number.isFinite(r) ? r : 0; }
    else if (entry !== '' || acc === null) acc = num(entry);
    op = k; entry = ''; fresh = false; last = '';
  }
  render();
}

export function setupCalculator() {
  const pad = $('calcPad');
  pad.innerHTML = KEYS.map(k => `<button type="button" class="ck${/[÷×−+=]/.test(k) ? ' opk' : ''}${k === 'C' ? ' clr' : ''}" data-k="${k}" aria-label="${{ '÷': 'divide', '×': 'times', '−': 'minus', '+': 'plus', '±': 'make negative or positive', '⌫': 'delete', 'C': 'clear', '=': 'equals' }[k] || k}">${k === '±' ? '+/−' : k}</button>`).join('');
  pad.querySelectorAll('.ck').forEach(b => b.addEventListener('click', () => press(b.dataset.k)));
  $('calcClose').addEventListener('click', () => toggleCalculator(false));
  $('calc').addEventListener('keydown', e => {
    const map = { '/': '÷', '*': '×', x: '×', '-': '−', '+': '+', Enter: '=', '=': '=', Backspace: '⌫', Escape: null, c: 'C' };
    if (/^\d$/.test(e.key)) { e.preventDefault(); press(e.key); }
    else if (e.key in map) { e.preventDefault(); e.stopPropagation(); if (map[e.key]) press(map[e.key]); else toggleCalculator(false); }
  });
  render();
}
/* onFirstUse is called once per puzzle when a key is pressed, for the grown-ups' report. */
export function toggleCalculator(open, useCb) {
  const el = $('calc'); const on = open ?? el.hidden;
  if (useCb) onUse = useCb;
  el.hidden = !on; $('calcBtn').setAttribute('aria-expanded', String(on));
  if (on) { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
}
export function resetCalculator() { acc = null; op = null; entry = ''; last = ''; fresh = false; if ($('calcOut')) render(); }
