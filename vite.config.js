import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One build, one self-contained index.html: all JS and CSS inlined.
// Three.js r128 stays on cdnjs and fonts on Google Fonts, so the file stays small
// and works as a Claude artifact, a double-clicked local file, or on GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: { target: 'es2019', outDir: 'dist', emptyOutDir: true },
});
