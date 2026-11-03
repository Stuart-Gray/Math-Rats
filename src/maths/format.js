/* How maths is written on screen. Pure string helpers, no DOM. */
export const X = '<i>x</i>';
export const F = n => n < 0 ? '−' + Math.abs(n) : String(n);          // −5 with a real minus sign
export const P = n => n < 0 ? '(' + F(n) + ')' : F(n);                 // (−5) when plugged in
export const frac = (t, b) => `<span class="frac"><span>${t}</span><span>${b}</span></span>`;
export const cn = (k, h) => `<span class="cn" data-k="${k}">${h}</span>`; // a term that gets slashed out
export const cf = n => n === 1 ? '' : String(n);                       // 1x is written x
export const Q = '{Q}';                                                 // answer box placeholder
export const plainEq = html => html
  .replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '$1/$2')
  .replace(/<[^>]+>/g, '');
