/* Hint text, "why it cancels" messages and the step factories used by the generator.
   Every step is "undo with the opposite operation, on both sides". */
import { X, F } from './format.js';

export function subHints(n,b){
  let trick;
  if(n-b<0||n<0) trick=`Use a number line: start at ${F(n)} and jump ${b} steps to the left. Passing zero is fine!`;
  else if(b===9) trick=`Mental math trick: to take away 9, take away 10, then add 1 back.`;
  else if(b>=10) trick=`Mental math trick: take away 10 first, then take away ${b-10} more.`;
  else trick=`Mental math trick: count back from ${F(n)} by ${b}.`;
  return [`Do the same thing to the right side: ${F(n)} − ${b}.`, trick];
}
export function addHints(n,b){
  let trick;
  if(n<0) trick=`Use a number line: start at ${F(n)} and jump ${b} steps to the right, toward zero.`;
  else if(b===9) trick=`Mental math trick: to add 9, add 10, then take 1 away.`;
  else if(b>=10) trick=`Mental math trick: add 10 first, then add ${b-10} more.`;
  else trick=`Mental math trick: count up from ${F(n)} by ${b}.`;
  return [`Do the same thing to the right side: ${F(n)} + ${b}.`, trick];
}
export function divHints(n,a){
  const skip=[1,2,3,4,5].map(k=>a*k).join(', ');
  return [`Do the same thing to the right side: ${F(n)} ÷ ${a}.`,
    `Think: ${a} × what = ${F(Math.abs(n))}? Skip-count by ${a}s: ${skip}…`+(n<0?` Then remember: a negative divided by a positive is negative.`:'')];
}
export function mulHints(n,a){
  let trick = a===2?`Times 2 is just doubling.`: a===4?`Times 4 is double, then double again.`: a===5?`Times 5 is times 10, then cut it in half.`:`Add ${F(n)} to itself ${a} times.`;
  if(n<0) trick+=` A negative times a positive stays negative.`;
  return [`Do the same thing to the right side: ${F(n)} × ${a}.`, trick];
}
export const byOrder = `Undo things in reverse order, like taking off your shoes before your socks. The last thing done gets undone first.`;
export const mAdd = b => `+ ${b} and − ${b} cancel out: together they make 0. The right side gets − ${b} too, so the seesaw stays balanced.`;
export const mSub = b => `− ${b} and + ${b} cancel out: together they make 0. The right side gets + ${b} too, so the seesaw stays balanced.`;
export const mMul = a => `${a} ÷ ${a} = 1, so the ${a} cancels and leaves just ${X}. The right side gets ÷ ${a} too.`;
export const mDiv = a => `Dividing by ${a} and then multiplying by ${a} cancel out, leaving just ${X}. The right side gets × ${a} too.`;
export const mBr = a => `${a} ÷ ${a} = 1, so the ${a} outside the brackets cancels and the brackets can go. The right side gets ÷ ${a} too.`;

/* Step factories. rv = the right-hand value before this step. */
export function sAdd(b,rv,alt,why,prompt){ return {prompt, ans:rv-b, numHints:subHints(rv,b), opHints:[why,byOrder],
  ops:[{label:`Subtract ${b} from both sides`,ok:true},{label:`Add ${b} to both sides`,fb:`Adding ${b} more just piles on extra! To undo “+ ${b}”, do the opposite: subtract ${b}.`},alt]}; }
export function sSub(b,rv,alt,why,prompt){ return {prompt, ans:rv+b, numHints:addHints(rv,b), opHints:[why,byOrder],
  ops:[{label:`Add ${b} to both sides`,ok:true},{label:`Subtract ${b} from both sides`,fb:`That takes away even more! The opposite of “− ${b}” is “+ ${b}”.`},alt]}; }
export function sMul(a,rv,alt,why,prompt){ return {prompt, ans:rv/a, numHints:divHints(rv,a), opHints:[why,`The opposite of multiplying by ${a} is dividing by ${a}.`],
  ops:[{label:`Divide both sides by ${a}`,ok:true},{label:`Multiply both sides by ${a}`,fb:`${X} is already being multiplied by ${a}. Multiplying again makes it bigger. The opposite of × is ÷.`},alt]}; }
export function sDiv(a,rv,alt,why,prompt){ return {prompt, ans:rv*a, numHints:mulHints(rv,a), opHints:[why,`The opposite of dividing by ${a} is multiplying by ${a}.`],
  ops:[{label:`Multiply both sides by ${a}`,ok:true},{label:`Divide both sides by ${a}`,fb:`${X} is already being divided by ${a}. Dividing again makes it even smaller. The opposite of ÷ is ×.`},alt]}; }

