# CLAUDE.md — working rules for Math Rats

## What this is
A 3D browser algebra game for Stuart's daughter (grade 7). Her pet rats Velma and Louise are the stars. See README.md for the full design.

## Source of truth
- `velma-and-louise-house-of-x.html` is the game. Build on it; never start over.
- Keep three copies in sync after every change: this repo, Stuart's local folder `C:\dev\Math Rats`, and the playable artifact "Math Rats 🐀🐀" (https://claude.ai/artifact/FSGYmkgmytudysA1tzp4EV, publish as a new version of that artifact).
- Stuart gives standing permission to commit, push and pull automatically.

## Technical constraints
- One self-contained HTML file. Three.js r128 from cdnjs only. Web Audio synthesized sound, no audio files.
- Must work on phone (tap floor to walk) and laptop (arrows/WASD, E to investigate).
- Don't rename localStorage keys (`vl-house-of-x-v1`, `vl-house-of-x-settings`, `vl-house-of-x-stats`) or saved progress is lost.
- Don't split into Vite modules until Stuart asks. When that happens: modules for maths, rooms, rats, audio, UI, progress; deploy on GitHub Pages.

## Math rules (don't break these)
- Every step: "undo with the opposite operation, on both sides", reverse order (shoes before socks).
- Vertical working layout: equation, opposite operations under the terms they undo on both sides, slashes through cancelling pairs, rule line, new equation with answer box.
- 3 operation choices per step with friendly wrong-answer explanations; arithmetic done mentally.
- Hints escalate strategy → mental-math tricks. Every solve ends with a "check it" line.
- **After changing the puzzle generator, check every type at every level so all answers and intermediate steps are whole numbers.**
- Easy and Medium never use negatives. The attic thermometer always goes below zero.

## Defaults (keep unless Stuart says otherwise)
- Music and SFX on, volume adjustable.
- One-step and two-step on; three-step and both-sides off.
- Adaptive difficulty on: per-type levels; two quick clean solves in a row → up; 2+ slips or hints → down.

## Characters and tone
- Velma and Louise travel side by side, Louise at Velma's side. Chocolate brown, cupped pink ears, fawn muzzle, pink nose, glossy black eyes, long whiskers, thick scaly tails. Louise is lighter with a broad white belly; Velma has a thin white chest stripe.
- Warm, inviting and funny: rat jokes, puns, rat-pleasing discoveries. Cheese crumbs reveal jokes.

## Working with Stuart
Be concise. Lead with what changed, then limitations. Let playtest results guide what changes next.
