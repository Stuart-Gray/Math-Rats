/* Velma & Louise: House of X. Boots the game and wires the title screen. */
import './styles.css';
import { $ } from './lib/util.js';
import { game, world } from './game/state.js';
import { ROOMS } from './rooms/data.js';
import { loadRun } from './progress/storage.js';
import { setupScreens } from './ui/screens.js';
import { setupPuzzle, debugCur } from './ui/puzzle.js';
import { setupCalculator } from './ui/calculator.js';
import { setupInput, startLoop } from './game/loop.js';
import { loadLevel, begin } from './game/flow.js';

setupScreens(); setupPuzzle(); setupCalculator(); setupInput();

// keep the Investigate button above the speech bubbles
const talk = $('talk');
new ResizeObserver(() => document.documentElement.style.setProperty('--talk-h', talk.offsetHeight + 'px')).observe(talk);

const run = loadRun();
if (run && run.level > 0 && run.level < ROOMS.length) {
  const c = $('contBtn'); c.hidden = false; c.textContent = `Continue in the ${ROOMS[run.level].short}`;
  c.onclick = () => begin(run.level, run.cheese || 0, run.head || 0, run.jokes);
}
$('startBtn').addEventListener('click', () => begin(0, 0, 0, []));
$('againBtn').addEventListener('click', () => { $('victory').hidden = true; begin(0, 0, 0, []); });

// test hook for automated playtests: open the game with #debug
if (location.hash === '#debug') window.__mr = { cur: debugCur, game, world };

// title backdrop: kitchen preview
loadLevel(0, true); game.paused = true;
startLoop();
