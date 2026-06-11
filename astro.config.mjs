// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Base path & site are env-driven so the SAME source builds for two targets:
//   - GitHub Pages (project site):  BASE_PATH=/andriiana-portfolio/  (the defaults)
//   - Container / Kubernetes (root): BASE_PATH=/  SITE_URL=https://portfolio.local
const base = process.env.BASE_PATH ?? '/andriiana-portfolio/';
const site = process.env.SITE_URL ?? 'https://vousya.github.io';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },
});
