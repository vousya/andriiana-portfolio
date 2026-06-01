# Andriiana — Portfolio

Single-page portfolio site for an SMM specialist, built from a Figma design.
Dark, bold, playful visual style with scroll-reveal animations.

**Live site:** https://vousya.github.io/andriiana-portfolio/

## Stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- Deployed to **GitHub Pages** via GitHub Actions

## Develop

```bash
npm install      # install dependencies
npm run dev      # local dev server with hot reload (http://localhost:4321)
npm run build    # production build -> dist/
npm run preview  # preview the production build locally
```

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes `dist/` to GitHub Pages.

> One-time setup in the repo: **Settings → Pages → Build and deployment →
> Source: GitHub Actions.**

## Editing content

- **Case studies** (projects, tasks, achievements): `src/data/projects.js`
- **About / bio text:** `src/components/About.astro`
- **Contact links** (Instagram / Telegram / Email placeholders):
  `src/components/Contact.astro`
- **Images:** `public/img/`
