# Math Rats 🐀🐀 — Velma & Louise: House of X

A cozy 3D browser game that helps a grade 7 student practise solving algebra equations and build mental math. The stars are two real pet rats, **Velma** and **Louise**, who sneak through a house solving equations on their way to the Legendary Snack Stash.

Built by Stuart (a dad who works in education and edtech) with Claude.

## Play it

Open `velma-and-louise-house-of-x.html` in any modern browser. It is one self-contained file; the only thing it loads from the internet is Three.js.

- **Laptop:** arrow keys or WASD to walk, **E** to investigate.
- **Phone or tablet:** tap the floor to walk, tap objects to investigate.

## The world

One room per level:

1. **Kitchen** — cookie jar on a scale, fridge magnets, toaster
2. **Living Room** — Sir Whiskerton the sleeping cat (and his collar tag)
3. **Attic** — the thermometer, which always goes below zero
4. **The Legendary Snack Stash**

Equations are woven into objects in each room. Cheese crumbs reveal rat jokes and puns.

**Velma and Louise** are sisters who travel side by side. Both are warm chocolate brown with large cupped pink ears, a lighter fawn muzzle, pink nose, big glossy black eyes, long whiskers and thick scaly tails. Louise is a touch lighter with a broad white belly curving up her sides; Velma has only a thin white chest stripe.

## How the math is taught

- Every step is **"undo with the opposite operation, on both sides"**, in reverse order (shoes before socks).
- Working is laid out vertically, like on paper: the equation on top, each opposite operation under the term it undoes on both sides, a slash through cancelling pairs, a rule line, then the new equation with an answer box.
- Each step: choose the operation from 3 options (wrong choices get a friendly explanation), then do the arithmetic mentally.
- Hints escalate from strategy to mental-math tricks: count back, take 10 then adjust, skip-count, number line for negatives.
- Every solve ends with a **"check it"** line that plugs x back in.
- **"Solve it in my head"** earns bonus cheese, then shows the full worked solution.
- A **recipe card** explains all the methods.

## Puzzle types

| Type | Forms | Default |
|---|---|---|
| One-step | x + b, x − b, ax, x/a (each room opens with one) | On |
| Two-step | ax ± b, x/a ± b, a(x + b) | On |
| Three-step | a(x + b) ± d, worked outside in | Off |
| Variables on both sides | ax + b = ex + d, gather the x's first | Off |

## Settings and difficulty

- Music and sound effects on, volume adjustable.
- **Adaptive difficulty** (default): each puzzle type has its own level. Two quick, clean solves in a row move it up; a puzzle with 2+ slips or hints moves it down.
- With adaptive off, pick a fixed level: Easy, Medium, Hard or Expert.
- Easy and Medium never use negative numbers.

## Grown-ups' progress report

**Press and hold for 2 seconds on the title screen.** For each puzzle type it shows level, number solved, first-try rate, average time, hints per puzzle and the trickiest part (choosing the step vs. the arithmetic), plus recent puzzles and a reset option.

Progress is saved in the browser's localStorage under `vl-house-of-x-v1`, `vl-house-of-x-settings` and `vl-house-of-x-stats`, so it is per browser and per device.

## Tech

- Single HTML file, Three.js r128 from cdnjs.
- All music and sound effects synthesized with Web Audio; no audio files.
- Also published as a playable Claude artifact ("Math Rats 🐀🐀").

## Roadmap

- Playtest with our player and let her results guide changes.
- Split into modules (maths, rooms, rats, audio, UI, progress) with Vite and deploy on GitHub Pages.
- New rooms: basement, garden, bathroom.
- Timed mental-math mini-game.
- More jokes and story moments.
- Real 3D rat models.
- Cross-device progress.
