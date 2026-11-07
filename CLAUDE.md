# CLAUDE.md — working rules for Math Rats

## What this is
A 3D browser algebra game for Stuart's daughter (grade 7). Her pet rats Velma and Louise are the stars. See README.md for the full design.

## Source of truth
- The game source is `index.html` + `src/` (Vite, ES modules). Build on it; never start over.
- `velma-and-louise-house-of-x.html` at the repo root is a **build output** (`npm run build` copies `dist/index.html` there). Don't hand-edit it; edit `src/` and rebuild. Commit it with each change so it stays playable by double-click.
- Keep three copies in sync after every change: this repo, Stuart's local folder `C:\dev\Math Rats` (copy the repo files there; it is not a git clone), and the playable artifact "Math Rats 🐀🐀" (https://claude.ai/artifact/FSGYmkgmytudysA1tzp4EV, publish the built single file as a new version of that artifact).
- Stuart gives standing permission to commit, push and pull automatically.

## Commands
- `npm run dev` — dev server. `npm test` — puzzle checker. `npm run build` — single-file build.
- Automated playtests can open the built file with `#debug` to get `window.__mr` (current puzzle, game, world, velma, louise).

## Module map
- `src/maths/` generator, hints, formatting. Pure, no DOM. `npm test` imports it.
- `src/rooms/data.js` story text, puzzle spots, crumbs, jokes per room. `furnish.js` builds each room's 3D props; `decor.js` adds wall art (canvas-drawn pictures), the maths clock and small animated props per room (walls only, never in walking paths). `world.js` renderer, camera, building blocks, ramps (raised floor), collision boxes.
- `src/rats/` Velma, Louise, Sir Whiskerton. `src/audio/` music and SFX.
- `src/ui/` puzzle sheet, working layout, calculator, speech bubble queue, menus/report.
- `src/game/cutscene.js` the intro (cage escape, `src/rooms/cage.js`) and ending (`src/rooms/stash.js`) cutscenes: keyframed rat tracks, camera shots, captions and sound cues, all derived from time t so skipping jumps to the end. Intro plays on every new run (not on Continue). `#debug` adds `__mr.seekCutscene(t)`.
- `src/progress/` localStorage, settings, stats, adaptive levels. `src/game/` shared state, loop, pathfinding, room flow.
- Shared mutable state lives on the `game` and `world` objects in `src/game/state.js`; never reassign them.

## Technical constraints
- The build must stay one self-contained HTML file. Three.js r128 from cdnjs only (global `THREE`, via `src/lib/three.js`). Web Audio synthesized sound, no audio files.
- Must work on phone (tap floor or a puzzle ring to walk) and laptop (arrows/WASD, E to investigate, G for "show me the way").
- Don't rename localStorage keys (`vl-house-of-x-v1`, `vl-house-of-x-settings`, `vl-house-of-x-stats`) or saved progress is lost. Saves without `rooms` are from the 3-room version; `loadRun` maps their attic (index 2) to index 3.
- Adding a room: add it to `ROOMS` in `data.js`, a builder in `furnish.js` (same index), and update `ROOM_COUNT` in `storage.js`.

## Math rules (don't break these)
- Every step: "undo with the opposite operation, on both sides", reverse order (shoes before socks).
- Vertical working layout: equation, opposite operations under the terms they undo on both sides, slashes through cancelling pairs, rule line, new equation with answer box.
- 3 operation choices per step with friendly wrong-answer explanations; arithmetic done mentally (the optional calculator is for checking, never fills the answer).
- Hints escalate strategy → mental-math tricks. Every solve ends with a "check it" line.
- **After changing the puzzle generator, run `npm test`: it checks every type at every level so all answers and intermediate steps are whole numbers.**
- Easy and Medium never use negatives. "Include negative integers" (setting `negatives`, default on) gates them at Hard/Expert too. The attic thermometer always goes below zero, whatever the setting.

## Defaults (keep unless Stuart says otherwise)
- Music and SFX on, volume adjustable. A different tune each run and room.
- One-step and two-step on; three-step and both-sides off. Calculator available in step-by-step mode.
- Adaptive difficulty on: per-type levels; two quick clean solves in a row → up; 2+ slips or hints → down.
- Speech: the bottom bar is for gameplay messages only (`say('n', …)` or `{ game: true }`), one at a time. Velma and Louise's jokes and chatter show as see-through bubbles above the speaking rat, one at a time, queued; `minor` chatter is skipped when busy. Timing based on length, paused while menus/puzzles are open; × or tap to close.
- Rats idle with blinks, ear flicks, whisker twitches and breathing (`idleLife` in `rat.js`).
- Rats never poke through the perimeter walls: `keepBodyInside` (loop.js) keeps nose and rump inside, `keepTailInside` (rat.js) swings or curls the tail along her side near a wall.

## Characters and tone
- Velma and Louise travel side by side, Louise at Velma's side. Chocolate brown, cupped pink ears, fawn muzzle, pink nose, glossy black eyes, long whiskers, thick scaly tails. Louise is lighter with a broad white belly; Velma has a thin white chest stripe.
- Warm, inviting and funny: rat jokes, puns, rat-pleasing discoveries. Cheese crumbs reveal jokes.

## Publishing
- GitHub Pages via `.github/workflows/pages.yml` (deploys `dist/` on push to main). Pages on a private repo needs a paid plan; Stuart decides whether to make the repo public.

## Working with Stuart
Be concise. Lead with what changed, then limitations. Let playtest results guide what changes next.
