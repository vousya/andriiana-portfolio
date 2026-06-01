// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://vousya.github.io/andriiana-portfolio/
  site: 'https://vousya.github.io',
  base: '/andriiana-portfolio/',
  vite: {
    plugins: [tailwindcss()],
  },
});
