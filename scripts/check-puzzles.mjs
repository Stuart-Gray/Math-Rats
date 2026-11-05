/* Checks every puzzle type at every level (CLAUDE.md rule):
   - every answer and every intermediate step is a whole number
   - the last step's answer is x, and plugging x back in balances the equation
   - Easy and Medium never use negative numbers
   - forced-negative puzzles (the attic thermometer) always go below zero
   - with "Include negative integers" off, no level uses negatives (except forced puzzles)
   Run with `npm test`. */
import { CATS, LEVEL_NAMES, makeProblem, hasNegative } from '../src/maths/generator.js';
import { plainEq } from '../src/maths/format.js';

const N = 3000;
let failures = 0, total = 0;
const fail = (msg, p) => { if (failures++ < 15) console.error('FAIL:', msg, p && plainEq(p.eq), p && p.steps.map(s => s.ans)); };

function balances(p) {
  // check strings look like "3 × (−2) + 5 = −1" or "left: … = 7 · right: … = 7"
  return plainEq(p.check).split(' · ').every(part => {
    const [lhs, rhs] = part.replace(/^(left|right): /, '').split(' = ');
    const js = s => s.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
    // eslint-disable-next-line no-new-func
    const v = Function(`return (${js(lhs)})`)();
    return Math.abs(v - Number(js(rhs))) < 1e-9;
  });
}

const types = Object.values(CATS).flat();
const rows = [];
for (const type of types) for (let lvl = 1; lvl <= 4; lvl++) for (const force of [false, true]) for (const allowNeg of [true, false]) {
  let negSeen = 0, maxAbs = 0;
  for (let i = 0; i < N; i++) {
    const p = makeProblem(type, lvl, force, allowNeg); total++;
    if (p.fallback) fail(`${type} L${lvl} force=${force} neg=${allowNeg} fell back`, p);
    if (p.type !== type && !p.fallback) fail(`${type} returned ${p.type}`, p);
    if (!p.steps.every(s => Number.isInteger(s.ans))) fail(`${type} L${lvl} non-integer step`, p);
    if (!Number.isInteger(p.c) || !Number.isInteger(p.x)) fail(`${type} L${lvl} non-integer c/x`, p);
    if (p.steps[p.steps.length - 1].ans !== p.x) fail(`${type} L${lvl} last step is not x`, p);
    if (!balances(p)) fail(`${type} L${lvl} check line does not balance`, p);
    if (lvl < 3 && !force && hasNegative(p)) fail(`${type} ${LEVEL_NAMES[lvl]} used a negative`, p);
    if (!allowNeg && !force && hasNegative(p)) fail(`${type} ${LEVEL_NAMES[lvl]} used a negative with negatives off`, p);
    if (force && p.x >= 0) fail(`${type} L${lvl} forced puzzle not below zero`, p);
    if (hasNegative(p)) negSeen++;
    maxAbs = Math.max(maxAbs, Math.abs(p.c), ...p.steps.map(s => Math.abs(s.ans)));
  }
  if (!force) rows.push((allowNeg ? '' : '[neg off] ') + `${type.padEnd(5)} ${LEVEL_NAMES[lvl].padEnd(7)} negatives ${String(Math.round(100 * negSeen / N)).padStart(3)}%  biggest number ${maxAbs}`);
}
console.log(rows.join('\n'));
console.log(`\nChecked ${total} puzzles across ${types.length} types × 4 levels (normal, forced-negative, negatives on and off).`);
if (failures) { console.error(`${failures} failures`); process.exit(1); }
console.log('All answers and steps are whole numbers; Easy/Medium never negative; negatives-off never negative; forced puzzles always below zero.');
