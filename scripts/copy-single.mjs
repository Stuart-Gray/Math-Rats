/* After `vite build`, copy the single-file game to the repo root under its familiar name,
   so it can be opened by double-clicking or published as the Claude artifact. */
import { copyFileSync, statSync } from 'node:fs';
copyFileSync('dist/index.html', 'velma-and-louise-house-of-x.html');
console.log(`velma-and-louise-house-of-x.html updated (${Math.round(statSync('dist/index.html').size / 1024)} KB)`);
