/* Starting a run, building each room, moving between rooms and the joke deck. */
import { THREE } from '../lib/three.js';
import { $, shuffle } from '../lib/util.js';
import { game, world } from './state.js';
import { ROOMS, JOKES } from '../rooms/data.js';
import { scene, canvas, shell, makeMarker, makeCrumb, clearRoom, heightAt } from '../rooms/world.js';
import { furnish } from '../rooms/furnish.js';
import { buildNav } from './nav.js';
import { velma, louise } from '../rats/index.js';
import { saveRun, clearRun } from '../progress/storage.js';
import { audio, sfx } from '../audio/audio.js';
import { say, clearSpeech, newScene } from '../ui/speech.js';
import { syncPause, updateHud } from '../ui/screens.js';
import { stopWalking } from './loop.js';

let deck = [];
function buildDeck(R) {
  const found = new Set(game.jokesFound);
  const gen = shuffle(JOKES.filter(j => !found.has(j[1])));
  const mine = shuffle((R.jokes || []).filter(j => !found.has(j[1])));
  deck = [];
  while (gen.length || mine.length) { if (mine.length) deck.push(mine.shift()); if (gen.length) deck.push(gen.shift()); }
}
export function drawJoke() {
  if (!deck.length) deck = shuffle(JOKES.concat(ROOMS[game.level].jokes || []));
  const j = deck.shift();
  if (!game.jokesFound.includes(j[1])) game.jokesFound.push(j[1]);
  return j;
}

export function loadLevel(r, silent) {
  clearRoom(); game.level = r; game.solved = 0; game.warmDone = false;
  const R = ROOMS[r];
  world.floor = shell(R.theme); furnish(r, R); buildNav();
  world.puzzles = R.puzzles.map(def => { const mk = makeMarker(def.at[0], def.at[1], def.gemY); return { def, x: def.at[0], z: def.at[1], ...mk, solved: false, data: null }; });
  world.crumbs = R.crumbs.map(([x, z]) => makeCrumb(x, z));
  scene.fog = new THREE.Fog(R.theme.bg, 30, 60);
  scene.background = new THREE.Color(R.theme.bg);
  velma.g.position.set(R.start[0], heightAt(R.start[0], R.start[1]), R.start[1]); velma.heading = Math.PI; velma.g.rotation.y = Math.PI;
  louise.g.position.set(R.start[0] + 1.2, 0, R.start[1] + 0.2); louise.heading = Math.PI;
  stopWalking();
  $('roomNum').textContent = `Room ${r + 1} of ${ROOMS.length}`; $('roomName').textContent = R.name;
  buildDeck(R);
  updateHud(); saveRun(game);
  newScene();
  if (!silent) { R.intro.forEach(l => say(l[0], l[1])); if (r === 0 && !('ontouchstart' in window)) say('n', 'Walk with the arrow keys or WASD, or click anywhere on the floor. Click a glowing ring and Velma runs straight to it.'); }
}

export function begin(level, cheese, head, jokes) {
  audio.init(); audio.newSong(); audio.apply();
  $('titleScreen').hidden = true; game.started = true;
  game.cheese = cheese; game.head = head; game.jokesFound = jokes || []; game.negTaught = false;
  clearSpeech(); loadLevel(level); syncPause(); canvas.focus({ preventScroll: true });
}

export function nextRoom() {
  game.paused = true; const f = $('fade'); sfx('door');
  const last = game.level >= ROOMS.length - 1;
  $('fadeText').innerHTML = last ? '' : `<span class="k">Room ${game.level + 2} of ${ROOMS.length}</span><b>${ROOMS[game.level + 1].name}</b>`;
  f.classList.add('on');
  setTimeout(() => {
    if (last) {
      f.classList.remove('on'); $('vCheese').textContent = game.cheese; $('vHead').textContent = game.head; $('vJokes').textContent = game.jokesFound.length;
      $('vPuzzles').textContent = ROOMS.length * 3; $('victory').hidden = false; syncPause(); clearRun(); return;
    }
    loadLevel(game.level + 1); audio.newSong();
    setTimeout(() => { f.classList.remove('on'); syncPause(); }, 900);
  }, 500);
}
