/* The puzzle generator. Pure functions with no DOM, so `npm test` can check
   every type at every level for whole-number answers and steps. */
import { rnd } from '../lib/util.js';
import { X, F, P, frac, cn, cf, Q } from './format.js';
import { sAdd, sSub, sMul, sDiv, mAdd, mSub, mMul, mDiv, mBr } from './hints.js';

/* Difficulty levels */
export const LV=[null,
  {a:[2,3],x:[1,6], b:[1,6], neg:0},
  {a:[2,5],x:[2,10],b:[1,9], neg:0},
  {a:[2,6],x:[2,12],b:[2,15],neg:.25},
  {a:[2,9],x:[2,12],b:[3,20],neg:.45}];
export const LEVEL_NAMES=['','Easy','Medium','Hard','Expert'];
export const CATS={one:['p1','m1','t1','d1'],two:['axpb','axmb','xdpb','xdmb','apar'],three:['apd','apm'],both:['vb']};
export const CAT_OF={}; Object.keys(CATS).forEach(k=>CATS[k].forEach(t=>CAT_OF[t]=k));
export const CAT_NAMES={one:'One-step',two:'Two-step',three:'Three-step',both:'Variables on both sides'};
const rr = r => rnd(r[0],r[1]);
function rx(R,force){ let x=rr(R.x); if(force||Math.random()<R.neg) x=-rnd(1,Math.max(3,R.x[1]-2)); return x; }

export function genProblem(type,lvl,force){
  const R=LV[lvl]; let a,b,c,d,x,e,k,q,eq,steps,L,check;
  switch(type){
  case 'p1': x=rx(R,force); b=rr(R.b); c=x+b;
    eq=`${X} + ${b} = ${F(c)}`;
    steps=[sAdd(b,c,{label:`Divide both sides by ${b}`,fb:`The ${b} is added to ${X}, not multiplying it. What undoes adding?`},`${b} was added to ${X}. What undoes adding?`,`What should we undo to get ${X} alone?`)];
    L={start:{A:X,B:cn('s0',`+ ${b}`),D:F(c)},ops:[{B:cn('s0',`− ${b}`),D:`− ${b}`,msg:mAdd(b)}],res:[{A:X,D:Q}]};
    check=`${P(x)} + ${b} = ${F(c)}`; break;
  case 'm1': x=rx(R,force); b= lvl<3&&x>0 ? rnd(R.b[0],Math.max(R.b[0],Math.min(R.b[1],x))) : rr(R.b); c=x-b;
    eq=`${X} − ${b} = ${F(c)}`;
    steps=[sSub(b,c,{label:`Multiply both sides by ${b}`,fb:`The ${b} is taken away from ${X}, not dividing it. What undoes subtracting?`},`${b} was taken away from ${X}. What undoes taking away?`,`What should we undo to get ${X} alone?`)];
    L={start:{A:X,B:cn('s0',`− ${b}`),D:F(c)},ops:[{B:cn('s0',`+ ${b}`),D:`+ ${b}`,msg:mSub(b)}],res:[{A:X,D:Q}]};
    check=`${P(x)} − ${b} = ${F(c)}`; break;
  case 't1': a=rr(R.a); x=rx(R,force); c=a*x;
    eq=`${a}${X} = ${F(c)}`;
    steps=[sMul(a,c,{label:`Subtract ${a} from both sides`,fb:`${a}${X} means ${a} times ${X}, not ${a} plus ${X}. What undoes multiplying?`},`${a}${X} means ${a} × ${X}. What undoes multiplying?`,`What should we undo to get ${X} alone?`)];
    L={start:{A:cn('s0',String(a))+X,D:F(c)},ops:[{A:cn('s0',`÷ ${a}`),D:`÷ ${a}`,msg:mMul(a)}],res:[{A:X,D:Q}]};
    check=`${a} × ${P(x)} = ${F(c)}`; break;
  case 'd1': a=rr(R.a); q=rx(R,force); x=a*q; c=q;
    eq=`${frac(X,a)} = ${F(q)}`;
    steps=[sDiv(a,q,{label:`Subtract ${a} from both sides`,fb:`${X} is being divided by ${a}, not having ${a} added. What undoes dividing?`},`${X} was shared into ${a} equal piles. We want the whole pile back.`,`What should we undo to get ${X} alone?`)];
    L={start:{A:frac(X,cn('s0',String(a))),D:F(q)},ops:[{A:cn('s0',`× ${a}`),D:`× ${a}`,msg:mDiv(a)}],res:[{A:X,D:Q}]};
    check=`${P(x)} ÷ ${a} = ${F(q)}`; break;
  case 'axpb': a=rr(R.a); x=rx(R,force); b=rr(R.b); c=a*x+b;
    eq=`${a}${X} + ${b} = ${F(c)}`;
    steps=[sAdd(b,c,{label:`Divide both sides by ${a}`,fb:`That's allowed, but it chops the ${b} into fractions. Rats like whole crumbs: undo the + ${b} first.`},`${X} was multiplied by ${a}, and then ${b} was added.`,`Step 1: What should we undo first?`),
           sMul(a,c-b,{label:`Subtract ${a} from both sides`,fb:`The ${a} is stuck to ${X} by multiplying, not adding. What undoes multiplying?`},`${a}${X} means ${a} groups of ${X}. We want just one.`,`Step 2: ${X} is being multiplied by ${a}. How do we undo that?`)];
    L={start:{A:`${a}${X}`,B:cn('s0',`+ ${b}`),D:F(c)},ops:[{B:cn('s0',`− ${b}`),D:`− ${b}`,msg:mAdd(b)},{A:cn('s1',`÷ ${a}`),D:`÷ ${a}`,msg:mMul(a)}],res:[{A:cn('s1',String(a))+X,D:Q},{A:X,D:Q}]};
    check=`${a} × ${P(x)} + ${b} = ${F(c)}`; break;
  case 'axmb': a=rr(R.a); x=rx(R,force); b= lvl<3&&a*x>R.b[0] ? rnd(R.b[0],Math.min(R.b[1],a*x-1)) : rr(R.b); c=a*x-b;
    eq=`${a}${X} − ${b} = ${F(c)}`;
    steps=[sSub(b,c,{label:`Divide both sides by ${a}`,fb:`Allowed, but messy: it turns the ${b} into a fraction. Undo the − ${b} first.`},`${X} was multiplied by ${a}, and then ${b} was taken away.`,`Step 1: What should we undo first?`),
           sMul(a,c+b,{label:`Add ${a} to both sides`,fb:`The ${a} is attached by multiplying, not subtracting. What undoes multiplying?`},`${a}${X} means ${a} groups of ${X}. We want just one.`,`Step 2: ${X} is being multiplied by ${a}. How do we undo that?`)];
    L={start:{A:`${a}${X}`,B:cn('s0',`− ${b}`),D:F(c)},ops:[{B:cn('s0',`+ ${b}`),D:`+ ${b}`,msg:mSub(b)},{A:cn('s1',`÷ ${a}`),D:`÷ ${a}`,msg:mMul(a)}],res:[{A:cn('s1',String(a))+X,D:Q},{A:X,D:Q}]};
    check=`${a} × ${P(x)} − ${b} = ${F(c)}`; break;
  case 'xdpb': case 'xdmb': { const plus=type==='xdpb', sg=plus?'+':'−', inv=plus?'−':'+';
    a=rr(R.a); q=rx(R,force); x=a*q; b= !plus&&lvl<3&&q>R.b[0] ? rnd(R.b[0],Math.min(R.b[1],q-1)) : rr(R.b); c= plus?q+b:q-b;
    eq=`${frac(X,a)} ${sg} ${b} = ${F(c)}`;
    const alt={label:`Multiply both sides by ${a}`,fb:`Allowed, but then you'd have to multiply the ${b} too. Extra work! Undo the ${sg} ${b} first.`};
    steps=[ plus? sAdd(b,c,alt,`${X} was divided by ${a}, and then ${b} was added.`,`Step 1: What should we undo first?`) : sSub(b,c,alt,`${X} was divided by ${a}, and then ${b} was taken away.`,`Step 1: What should we undo first?`),
            sDiv(a,q,{label:`Add ${a} to both sides`,fb:`The ${a} is dividing ${X}, not subtracting from it. What undoes dividing?`},`${frac(X,a)} means ${X} was shared into ${a} equal piles.`,`Step 2: ${X} is being divided by ${a}. How do we undo that?`)];
    L={start:{A:frac(X,a),B:cn('s0',`${sg} ${b}`),D:F(c)},ops:[{B:cn('s0',`${inv} ${b}`),D:`${inv} ${b}`,msg:plus?mAdd(b):mSub(b)},{A:cn('s1',`× ${a}`),D:`× ${a}`,msg:mDiv(a)}],res:[{A:frac(X,cn('s1',String(a))),D:Q},{A:X,D:Q}]};
    check=`${P(x)} ÷ ${a} ${sg} ${b} = ${F(c)}`; break; }
  case 'apar': a=rnd(2,Math.min(5,R.a[1])); x=rx(R,force); b=rnd(1,Math.min(8,R.b[1])); c=a*(x+b);
    eq=`${a}(${X} + ${b}) = ${F(c)}`;
    steps=[sMul(a,c,{label:`Subtract ${b} from both sides`,fb:`The ${b} is inside the brackets, hugging ${X}. The ${a} outside multiplies the whole bracket, so undo that first.`},`The ${a} outside the brackets multiplies everything inside.`,`Step 1: Brackets! What should we undo first?`),
           sAdd(b,x+b,{label:`Divide both sides by ${b}`,fb:`The ${b} is added to ${X}, not multiplying it. What undoes adding?`},`${b} was added to ${X}.`,`Step 2: Now it's ${X} + ${b}. How do we get ${X} alone?`)];
    L={start:{A:cn('s0',String(a))+`(${X}`,B:`+ ${b})`,D:F(c)},ops:[{A:cn('s0',`÷ ${a}`),D:`÷ ${a}`,msg:mBr(a)},{B:cn('s1',`− ${b}`),D:`− ${b}`,msg:mAdd(b)}],res:[{A:X,B:cn('s1',`+ ${b}`),D:Q},{A:X,D:Q}]};
    check=`${a} × (${F(x)} + ${b}) = ${F(c)}`; break;
  case 'apd': case 'apm': { const plus=type==='apd', sg=plus?'+':'−', inv=plus?'−':'+';
    a=rnd(2,Math.min(5,R.a[1])); x=rx(R,force); b=rnd(1,Math.min(8,R.b[1])); d=rr(R.b); const inner=x+b, mid=a*inner; c= plus? mid+d : mid-d;
    eq=`${a}(${X} + ${b}) ${sg} ${d} = ${F(c)}`;
    const lock={label:`Subtract ${b} from both sides`,fb:`The ${b} is locked inside the brackets. Work from the outside in: the ${sg} ${d} was the last thing done.`};
    steps=[ plus? sAdd(d,c,lock,`Work from the outside in. The ${sg} ${d} sits outside everything else.`,`Step 1: Three steps this time! What should we undo first?`)
                : sSub(d,c,lock,`Work from the outside in. The ${sg} ${d} sits outside everything else.`,`Step 1: Three steps this time! What should we undo first?`),
            sMul(a,mid,{label:`Subtract ${b} from both sides`,fb:`The ${b} is still inside the brackets. Free the bracket first by undoing the × ${a} outside.`},`The ${a} outside the brackets multiplies the whole bracket.`,`Step 2: The ${a} multiplies the whole bracket. How do we undo that?`),
            sAdd(b,inner,{label:`Divide both sides by ${b}`,fb:`The ${b} is added to ${X}, not multiplying it. What undoes adding?`},`${b} was added to ${X}.`,`Step 3: Last one! How do we get ${X} alone?`)];
    L={start:{A:`${a}(${X}`,B:`+ ${b})`,C:cn('s0',`${sg} ${d}`),D:F(c)},
       ops:[{C:cn('s0',`${inv} ${d}`),D:`${inv} ${d}`,msg:plus?mAdd(d):mSub(d)},{A:cn('s1',`÷ ${a}`),D:`÷ ${a}`,msg:mBr(a)},{B:cn('s2',`− ${b}`),D:`− ${b}`,msg:mAdd(b)}],
       res:[{A:cn('s1',String(a))+`(${X}`,B:`+ ${b})`,D:Q},{A:X,B:cn('s2',`+ ${b}`),D:Q},{A:X,D:Q}]};
    check=`${a} × (${F(x)} + ${b}) ${sg} ${d} = ${F(c)}`; break; }
  case 'vb': { e=rnd(1,Math.max(1,R.a[1]-3)); k=rnd(2,Math.max(2,Math.min(5,R.a[1]-1))); a=e+k; x=rx(R,force); b=rr(R.b); d=k*x+b;
    if(d<=0){ x=Math.abs(x); d=k*x+b; }
    const ex=`${cf(e)}${X}`;
    eq=`${a}${X} + ${b} = ${ex} + ${d}`;
    steps=[{prompt:`Step 1: There are ${X}'s on both sides! What should we do first?`, ans:k, coef:true,
             ops:[{label:`Subtract ${ex} from both sides`,ok:true},{label:`Add ${ex} to both sides`,fb:`That piles even more ${X}'s on the left and leaves ${X}'s on the right. To clear the right side, subtract ${ex}.`},{label:`Subtract ${b} from both sides`,fb:`That would work too! But let's gather all the ${X}'s on one side first. It keeps things tidy.`}],
             opHints:[`Gather all the ${X}'s on one side. The right side has the smaller group: ${ex}.`,`Take ${ex} away from both sides, so the ${X}'s on the right cancel out.`],
             numHints:[`On the left: ${a}${X} − ${ex}. How many ${X}'s are left?`,`Think of each ${X} as a bag of seeds: ${a} bags take away ${e} bag${e>1?'s':''} leaves how many bags?`]},
           sAdd(b,d,{label:`Divide both sides by ${k}`,fb:`Allowed, but it chops the ${b} into fractions. Undo the + ${b} first.`},`${X} was multiplied by ${k}, and then ${b} was added.`,`Step 2: Now the ${X}'s are all on the left. What should we undo next?`),
           sMul(k,d-b,{label:`Subtract ${k} from both sides`,fb:`The ${k} is stuck to ${X} by multiplying, not adding. What undoes multiplying?`},`${k}${X} means ${k} × ${X}.`,`Step 3: Last step! How do we undo × ${k}?`)];
    L={start:{A:`${a}${X}`,B:`+ ${b}`,D:cn('s0',ex),E:`+ ${d}`},
       ops:[{A:`− ${ex}`,D:cn('s0',`− ${ex}`),msg:`${ex} − ${ex} = 0, so the ${X}'s on the right cancel out. On the left, ${a}${X} − ${ex} leaves fewer ${X}'s. How many? Fill in the box.`},
            {B:cn('s1',`− ${b}`),D:`− ${b}`,msg:mAdd(b)},{A:cn('s2',`÷ ${k}`),D:`÷ ${k}`,msg:mMul(k)}],
       res:[{A:`${Q}${X}`,B:cn('s1',`+ ${b}`),D:F(d)},{A:cn('s2',String(k))+X,D:Q},{A:X,D:Q}]};
    const val=a*x+b;
    check=`left: ${a} × ${P(x)} + ${b} = ${F(val)} · right: ${e} × ${P(x)} + ${d} = ${F(val)}`;
    c=d; break; }
  }
  return {type,cat:CAT_OF[type],lvl,a,b,c,x,eq,steps,L,check};
}
export function makeProblem(type,lvl,force){
  // Easy and Medium never use negatives (unless the room forces it, like the attic thermometer).
  // Every answer and every intermediate step must be a whole number.
  for(let i=0;i<200;i++){
    const p=genProblem(type,lvl,force);
    if(lvl<3 && !force && hasNegative(p)) continue;
    if(force && p.x>=0) continue;
    if(p.steps.every(s=>Number.isInteger(s.ans)) && Number.isInteger(p.c) && p.steps[p.steps.length-1].ans===p.x) return p;
  }
  const p=genProblem('axpb',1,!!force); p.fallback=true; return p;
}
export const hasNegative = p => p.x<0 || p.c<0 || p.steps.some(s=>s.ans<0);
