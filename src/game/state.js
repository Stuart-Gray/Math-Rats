/* Shared, mutable game state. Modules change properties on these objects; they never reassign them. */
export const game = {
  level: 0, cheese: 0, head: 0, solved: 0,
  paused: true, started: false, transition: false,
  warmDone: false,          // each room opens with a one-step warm-up
  jokesFound: [],           // joke texts heard this run, for the joke book
  negTaught: false,         // shown how to type a negative answer yet?
  lastLv: null,
};
export const world = {
  puzzles: [], crumbs: [], door: null, floor: null,
  cols: [],                 // collision boxes {x, z, w, d}
  ramps: [],                // raised floor (towel into the tub)
  fades: [],                // furniture that turns see-through when the rats are underneath
  anim: [],                 // per-frame room animations (t, dt) => void
  catZs: [],
  lap: null,                // the toilet zoomies tracker
};
