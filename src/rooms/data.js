/* The story side of each room: names, intro lines, puzzle spots, cheese crumbs and solve lines.
   The 3D furniture for each room lives in furnish.js. */
import { X } from '../maths/format.js';

export const PRAISE = ['Squeak-tacular!', 'You are the big cheese!', 'Rat-tastic work!', 'Whisker-licking good!', 'Tail-wiggling perfect!', 'Absolutely gnaw-some!', 'Cheddar than ever!', 'Brie-lliant!'];

/* Jokes anywhere in the house. Each crumb reveals the next joke from a shuffled deck, so no repeats in a run. */
export const JOKES = [
  ['v', 'Why did the rat bring a ladder to math class? To reach the higher numbers!'],
  ['l', 'I found a Cheerio. I am wearing it as a crown now.'],
  ['v', 'What do you call a rat who solves equations? A mathe-RAT-ician!'],
  ['l', 'Fun fact: x is just a snack hiding in a box. Algebra is how we find out how big the box is.'],
  ['v', 'A raisin! Wait. That is a raisin, right? …Right?'],
  ['l', 'Why are rats great at algebra? We are experts at finding hidden things.'],
  ['v', 'Found a button. Not a snack. Keeping it anyway.'],
  ['l', 'What did the 0 say to the 8? Nice belt!'],
  ['v', 'This crumb tastes like toast, adventure, and a little bit of carpet.'],
  ['l', 'How do rats check their answers? Plug x back in and squeak “yep!”'],
  ['v', 'Louise, I think this crumb is older than us.'],
  ['l', 'Variables are like cheese in a lunchbox. You know it is in there. You just do not know how much.'],
  ['v', 'Why was the equals sign so humble? It knew it was not less than or greater than anyone.'],
  ['l', 'I am not saying I am the best at math. I am saying math has never beaten me in a sniff-off.'],
  ['v', 'Seven ate nine? Rude. I would have shared.'],
  ['l', 'Why did the cheese go to math class? It wanted to be a little grater.'],
  ['v', 'Why do we undo in reverse order? You cannot take your socks off before your shoes. I tried. Do not try.'],
  ['l', 'What did one equals sign say to the other? “You are just like me!”'],
  ['v', 'I tried to count every crumb in this house. I got to x and lost count.'],
  ['l', 'Why did the rat sit on the calculator? She wanted to count on her friends.'],
  ['v', 'Negative numbers are just numbers that went to the basement for snacks.'],
  ['l', 'Why are rats never lonely doing algebra? There is always a variable to keep us company.'],
];

export const ROOMS = [
  { name: 'The Kitchen', short: 'kitchen',
    theme: { floor: ['#c98f57', '#c48a50', '#8d5b31'], wall: ['wallpaper', '#a9c7a8', '#9dbd9c', '#f3e4c4'], trim: 0xf4e6cc, bg: 0xd9c4a2, out: 0xa88a66 },
    intro: [['v', 'We made it to the kitchen. I can smell toast crumbs from here.'], ['l', 'Glowing rings mean puzzles. Tap one and we will scurry right over. Solve all three and the mouse hole opens!']],
    start: [0, 5], door: -4.5,
    crumbs: [[-4.5, 1.8], [4, 6.2], [-6.5, 0], [9.5, -1], [1, 1.5]],
    jokes: [['l', 'The fridge hums all day. I think it is singing to the cheese.'], ['v', 'Why did the toast blush? It saw the salad dressing.']],
    puzzles: [
      { id: 'jar', name: 'The cookie jar scale', at: [6.5, -2.5], pref: 'axpb',
        story: p => p.type === 'axpb' && p.x > 0
          ? [['v', `The cookie jar is sitting on the kitchen scale! Inside are ${p.a} bags of sunflower seeds that each weigh ${X} grams, plus a ${p.b} gram cracker.`], ['l', `The scale says ${p.c} grams. If we find ${X}, we know how heavy one bag of seeds is!`]]
          : [['v', 'The cookie jar is on the kitchen scale, and the scale is showing an equation instead of a number.'], ['l', 'Solve it and the lid pops off. Cookie crumbs, here we come.']] },
      { id: 'fridge', name: 'The fridge magnets', at: [-8.8, -4.2], pref: 'axpb',
        story: () => [['l', 'Somebody spelled out an equation in fridge magnets. The sticky note says “Solve me and the yogurt is yours.”'], ['v', 'Yogurt. YOGURT. Louise, we are doing this.']] },
      { id: 'toast', name: 'The crumby toaster', at: [7.5, 4], pref: 'axmb',
        story: p => p.type === 'axmb' && p.x > 0 && p.c > 0
          ? [['v', `The toaster made ${p.a} slices of toast with ${X} crumbs on each slice. Then Louise ate ${p.b} crumbs.`], ['l', `Allegedly ate. Anyway, now there are ${p.c} crumbs left. How many crumbs were on each slice?`]]
          : [['v', 'The toaster dial is stuck on a mystery setting called x.'], ['l', 'Solve the equation and the toast pops. Probably with crumbs. Hopefully with crumbs.']] },
    ] },
  { name: 'The Living Room', short: 'living room',
    theme: { floor: ['#a8673f', '#a16139', '#6e3f22'], wall: ['wallpaper', '#e8b9a4', '#e2ae98', '#fff2dc'], trim: 0xf4e6cc, bg: 0xd8bfae, out: 0xa28473 },
    intro: [['l', 'The living room! Careful: Sir Whiskerton naps on the rug.'], ['v', 'Big cat. Big snore. Let us tiptoe.']],
    start: [0, 6], door: -4.5,
    crumbs: [[-8, 6], [9, 5], [3.5, -3.5], [-3, -1], [6, 2]],
    jokes: [['l', 'Sir Whiskerton snores in three-four time. It is basically a waltz.'], ['v', 'What do cats eat for breakfast? Mice Krispies. …We do not talk about that one.']],
    puzzles: [
      { id: 'basket', name: 'The sock basket', at: [-6, 4], pref: 'xdpb',
        story: p => p.type === 'xdpb' && p.x > 0
          ? [['l', `A pile of ${X} socks got shared equally between ${p.a} drawers. One drawer's socks, plus the ${p.b} socks hiding under the couch, makes ${p.c}.`], ['v', 'Socks make the coziest nests. How many socks were in the whole pile?']]
          : [['l', 'The sock basket has a laundry tag with an equation on it.'], ['v', 'Solve it and we can build a sock nest. The best kind of nest.']] },
      { id: 'piano', name: 'The piano note', at: [8, -4.5], pref: 'axmb',
        story: () => [['v', 'There is a note taped to the piano: “Play key number x.”'], ['l', 'There is an equation underneath. Solve it and we can play a song. Velma will dance.'], ['v', 'I will NOT dance. …I might dance.']] },
      { id: 'cat', name: 'Sir Whiskerton’s collar tag', at: [0.5, 2.6], pref: 'xdmb',
        story: () => [['l', '(whispering) His collar tag has a riddle engraved on it.'], ['v', '(whispering) If we solve it quietly, we can sneak past. No squeaking. Not even a little squeak.']] },
    ] },
  { name: 'The Bathroom', short: 'bathroom',
    theme: { floor: ['tiles', '#ece3d3', '#a9cfc9'], wall: ['tiles', '#cfe9e4', '#b4d8d2', '#ffffff'], trim: 0xffffff, bg: 0xbcd3cf, out: 0x86a8a3 },
    intro: [['v', 'The bathroom! Our favourite place to explore when we sneak out of the cage.'], ['l', 'The full tour: under the vanity, up the towel into the tub, and laps around the toilet. Not IN the toilet. Around it.']],
    start: [-1, 5.5], door: 0.8,
    crumbs: [[-6.6, -6.0], [8.6, -5.2], [-10.0, 2.2], [-6.4, 1.2], [3.5, 2.5], [6.4, -3.0]],
    jokes: [['v', 'Why did the rat take a bubble bath? To get squeaky clean!'], ['l', 'I see a rat in the mirror. She is VERY good-looking.'],
      ['v', 'What did the bubble say to the rubber duck? “Stop quacking me up!”'], ['l', 'Why is the bathroom great at math? It is full of square tiles.'],
      ['v', 'Toilet paper: like a cozy scarf that never ends.'], ['l', 'Why did the toothbrush go to math class? To brush up on its skills.']],
    puzzles: [
      { id: 'vanity', name: 'The drippy pipe under the vanity', at: [-4.8, -6.4], pref: 'axpb', gemY: 1.15,
        story: p => p.type === 'axpb' && p.x > 0
          ? [['v', `We are under the vanity! The pipe drips ${X} drops into a bottle cap every minute. After ${p.a} minutes, plus the ${p.b} drops already there, the cap holds ${p.c} drops.`], ['l', `How many drops fall each minute? Find ${X} and we can fix it with a sock. Probably.`]]
          : [['v', 'Under the vanity there is a bottle of bubble bath with an equation on the label.'], ['l', 'Solve it and the cap pops open. Bubbles, here we come.']] },
      { id: 'tub', name: 'The rubber duck fleet', at: [8.2, -6.3], pref: 'apar',
        story: p => p.type === 'apar' && p.x > 0
          ? [['l', `We climbed the towel into the tub! The bath toys are lined up in ${p.a} rows. Each row has ${X} rubber ducks and ${p.b} toy boat${p.b > 1 ? 's' : ''}.`], ['v', `That is ${p.c} bath toys in all. How many ducks in each row?`]]
          : [['l', 'We climbed the towel into the tub! The biggest rubber duck has an equation written on its bottom.'], ['v', 'Typical duck. Solve it and the duck squeaks.']] },
      { id: 'loo', name: 'The toilet paper tower', at: [-6.4, 4.6], pref: 'xdmb',
        story: p => p.type === 'xdmb' && p.x > 0 && p.c > 0
          ? [['v', `A roll of ${X} sheets got shared equally between ${p.a} rats. Then I used ${p.b} of my sheets to make a nest.`], ['l', `Now you have ${p.c} sheets left. How many sheets were on the whole roll?`]]
          : [['v', 'Someone stacked the spare toilet paper into a tower, and the top roll has an equation on it.'], ['l', 'Solve it and we get the cardboard tube. Best toy ever.']] },
    ] },
  { name: 'The Attic', short: 'attic',
    theme: { floor: ['#8b6b4a', '#846445', '#5a432c'], wall: ['planks', '#7a5a3c', '#735538', '#4f3a26'], trim: 0x4a3424, bg: 0x46374a, out: 0x3a2e3e },
    intro: [['v', 'The attic! Dusty, creaky, and full of treasure.'], ['l', 'It is chilly up here. Watch out for numbers below zero.']],
    start: [0, 5.5], door: -1.5,
    crumbs: [[-9, 5], [9.5, 6], [2, -2], [-3, 2], [8.5, -1]],
    jokes: [['v', 'I found a box labelled “Holiday stuff”. I am not opening it. …I am opening it.'], ['l', 'Why are attic ghosts bad at algebra? They never show their working. Or themselves.']],
    puzzles: [
      { id: 'trunk', name: 'Grandma’s old trunk', at: [-6, -3.9], pref: 'apar',
        story: () => [['v', 'An old trunk with a number lock! The lock has an equation engraved on it.'], ['l', 'If it has brackets, remember: the numbers inside stick together. Like us.']] },
      { id: 'thermo', name: 'The chilly thermometer', at: [5, -6.4], pref: 'axpb', forceNeg: true,
        story: () => [['l', 'Brrr. This thermometer is so old it shows the temperature as an equation.'], ['v', `${X} is the temperature in °C. It is below zero up here, so the answer will be a negative number!`]] },
      { id: 'music', name: 'The music box', at: [6, 4], pref: 'xdmb',
        story: () => [['v', `A music box! It will only play if you find the magic number ${X}.`], ['l', 'Someone scratched an equation into the bottom. Let us solve it.']] },
    ] },
];

export const SOLVE_LINES = {
  jar: [['l', 'One bag of seeds, coming right up. Crunch.']],
  fridge: [['v', 'The fridge is open! Yogurt achieved. This is the best day of my life.']],
  toast: [['l', 'Okay, fine. I ate the crumbs. They were delicious and I regret nothing.']],
  basket: [['v', 'Sock nest: built. Napping in it: later.']],
  piano: [['l', 'Velma is dancing. She says she isn’t. She is.']],
  cat: [['v', '(whispering) We did it. He didn’t even twitch a whisker.']],
  vanity: [['l', 'Drip fixed! Well, drip counted. Counting is basically fixing.']],
  tub: [['v', 'SQUEAK! The duck squeaked back. I think we are friends now.'], ['l', 'Velma, it is a toy.'], ['v', 'A toy FRIEND.']],
  loo: [['l', 'Cardboard tube acquired. I will be living in it now. Please forward my mail.']],
  trunk: [['l', 'Old photos, a tiny teacup, and a single peanut. Treasure!']],
  thermo: [['v', 'Below zero! No wonder my tail is cold.']],
  music: [['l', 'It’s playing! Velma, it’s our song.'], ['v', 'We have a song?']],
};
