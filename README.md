# Math Rats 🐀🐀 — Velma & Louise: House of X

A cozy 3D browser game that helps a grade 7 student practise solving algebra equations and build mental math. The stars are two real pet rats, **Velma** and **Louise**, who sneak through a house solving equations on their way to the Legendary Snack Stash.

Built by Stuart (a dad who works in education and edtech) with Claude.

## Play it

- **Easiest:** open `velma-and-louise-house-of-x.html` in any modern browser. It is one self-contained file; the only things it loads from the internet are Three.js and the fonts.
- **Online:** once GitHub Pages is switched on (see *Publishing* below), the game lives at `https://stuart-gray.github.io/Math-Rats/`.

Controls:

- **Tap or click a glowing ring** and Velma scurries straight there, around the furniture, and opens the puzzle.
- **Tap the floor** to walk anywhere (or drag to steer), or use the **arrow keys / WASD**.
- **🐾 Show me the way** (or **G**) walks to the nearest puzzle, or to the mouse hole once it's open.
- **E** (or the Investigate button) opens a puzzle you're standing next to.
- **Tap the cheese counter** to open the joke book.

## The world

One room per level:

1. **Kitchen**: cookie jar on a scale, fridge magnets, toaster
2. **Living Room**: Sir Whiskerton the sleeping cat (and his collar tag), the sock basket, the piano
3. **Bathroom**: the drippy pipe under the vanity, the rubber duck fleet in the tub (climb in and out up the towel), and the toilet paper tower. Run a full lap around the toilet for a zoomies bonus.
4. **Attic**: Grandma's trunk, the music box and the thermometer, which always goes below zero
5. **The Legendary Snack Stash**

Equations are woven into objects in each room. Cheese crumbs reveal rat jokes and puns, without repeats in a run.

**Velma and Louise** are sisters who travel side by side. Both are warm chocolate brown with large cupped pink ears, a lighter fawn muzzle, pink nose, big glossy black eyes, long whiskers and thick scaly tails. Louise is a touch lighter with a broad white belly curving up her sides; Velma has only a thin white chest stripe.

## How the math is taught

- Every step is **"undo with the opposite operation, on both sides"**, in reverse order (shoes before socks).
- Working is laid out vertically, like on paper: the equation on top, each opposite operation under the term it undoes on both sides, a slash through cancelling pairs, a rule line, then the new equation with an answer box.
- Each step: choose the operation from 3 options (wrong choices get a friendly explanation), then do the arithmetic mentally.
- Hints escalate from strategy to mental-math tricks: count back, take 10 then adjust, skip-count, number line for negatives.
- **Negative answers:** the **+/−** button next to every answer box flips the sign. The first negative answer in a run shows a tip on how to enter it, and typing the right number with the wrong sign gets a "so close, flip the sign" message instead of a plain "not quite".
- **Calculator:** in step-by-step mode a **🧮 Calculator** button opens Louise's pocket calculator for checking mental math before pressing Check. It can be switched off in Settings. Use is shown in the grown-ups' report but doesn't count as a slip.
- Every solve ends with a **"check it"** line that plugs x back in.
- **"Solve it in my head"** earns bonus cheese, then shows the full worked solution.
- A **recipe card** explains all the methods, including how to enter negative numbers.

## Puzzle types

| Type | Forms | Default |
|---|---|---|
| One-step | x + b, x − b, ax, x/a (each room opens with one) | On |
| Two-step | ax ± b, x/a ± b, a(x + b) | On |
| Three-step | a(x + b) ± d, worked outside in | Off |
| Variables on both sides | ax + b = ex + d, gather the x's first | Off |

## Settings and difficulty

- Music and sound effects on, volume adjustable. Each run (and each room) picks a different tune in the same cozy style; "Play a different tune" skips to another.
- Speech bubbles stay long enough to read (longer for longer jokes), queue up instead of replacing each other, pause while a puzzle is open, and have an × to close them. Settings can make them stay extra long or until closed.
- **Adaptive difficulty** (default): each puzzle type has its own level. Two quick, clean solves in a row move it up; a puzzle with 2+ slips or hints moves it down.
- With adaptive off, pick a fixed level: Easy, Medium, Hard or Expert.
- Easy and Medium never use negative numbers.

## Grown-ups' progress report

**Press and hold for 2 seconds** on the title screen ("For grown-ups"). For each puzzle type it shows level, number solved, first-try rate, average time, hints per puzzle, calculator use and the trickiest part (choosing the step vs. the arithmetic), plus recent puzzles and a reset option.

Progress is saved in the browser's localStorage under `vl-house-of-x-v1`, `vl-house-of-x-settings` and `vl-house-of-x-stats`, so it is per browser and per device.

## Developing

Needs Node 20 or newer.

```bash
npm install        # once
npm run dev        # live-reloading dev server at http://localhost:5173
npm test           # checks every puzzle type at every level (whole numbers, no negatives on Easy/Medium)
npm run build      # builds dist/index.html and copies it to velma-and-louise-house-of-x.html
```

The build produces **one self-contained HTML file** (all JS and CSS inlined; Three.js r128 from cdnjs). The same file is used for GitHub Pages, the Claude artifact and double-click play.

### Code layout

```
index.html              page markup (HUD, puzzle sheet, menus)
src/main.js             boots the game
src/styles.css          all styles
src/maths/              puzzle generator, hints, maths formatting (no DOM, tested by npm test)
src/rooms/              room story data, 3D stage and furniture for each room
src/rats/               Velma, Louise and Sir Whiskerton
src/audio/              synthesized music (with tune variety) and sound effects
src/ui/                 puzzle sheet, working, calculator, speech bubbles, menus and reports
src/progress/           saving, settings, stats and adaptive difficulty
src/game/               shared state, game loop, tap-to-walk pathfinding, room flow
scripts/                puzzle checker and build helper
.github/workflows/      GitHub Pages deploy and pull-request checks
```

## Publishing (free)

**Recommended: GitHub Pages.** It's free, fast, and works on laptops, Chromebooks, iPads and iPhones. The workflow in `.github/workflows/pages.yml` builds and deploys on every push to `main`.

One catch: GitHub Pages on a **private** repo needs a paid GitHub plan. The free route is to make the repo public (Settings → General → Danger Zone → Change visibility), then Settings → Pages → Source: **GitHub Actions**. Nothing in the repo is secret, and progress is saved on each player's own device, not in the repo.

Alternatives if the repo should stay private: Netlify or Cloudflare Pages (both free, connect to a private repo), or embed the single HTML file in a Google Site with an "Embed code" block (works, but the game runs in a small frame).

## Roadmap

- Playtest with our player and let her results guide changes.
- New rooms: basement, garden.
- Timed mental-math mini-game.
- More jokes and story moments.
- Real 3D rat models.
- Cross-device progress.
