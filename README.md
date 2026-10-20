# DigiZoo

A sticker-book PWA for babies and kids. Pick a world (Safari, Jungle, Rainforest, Desert, Farm, Ocean),
then play with cute animal stickers: drag, pinch to scale and rotate, flip, duplicate, layer, delete,
tap ▶ to hear the animal and 🐾 to make it walk, swim, hop or fly across the map. Toggle day and
night, zoom and pan around, and start over whenever you like. Everything is saved on the device and
works offline once installed.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
```

| Script                | What it does                                                                           |
| --------------------- | -------------------------------------------------------------------------------------- |
| `npm run dev`         | Vite dev server                                                                        |
| `npm run build`       | Type-check and build to `dist/` (set `BASE_PATH=/repo/` for Pages)                     |
| `npm run preview`     | Serve the production build                                                             |
| `npm test`            | Unit tests (Vitest)                                                                    |
| `npm run e2e`         | End-to-end tests (Playwright: desktop Chromium, iPad + iPhone WebKit)                  |
| `npm run art:preview` | Render animal sheets to `.art-preview/` (`-- lion`, `-- --sheet`, `-- --scene safari`) |
| `npm run icons`       | Regenerate the PWA icons in `public/`                                                  |

## Deploy to GitHub Pages

1. Push the repo to GitHub.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds with the right base path
   (`/<repo>/`, or `/` for a `<user>.github.io` repo) and publishes it.

## How it is made

There are no image or audio files. Everything is generated from code:

- **Animals** (`src/art/animals/*.ts`) are rigged vector drawings: a tree of parts (body, legs, head,
  tail…) with pivots. `src/art/core/render.ts` turns each one into an SVG sticker with a white die-cut
  border in three finishes — **cartoon**, **comic** (ink + halftone) and **painted** (texture filters).
  `src/art/core/motion.ts` animates the parts for each way of moving (walk, waddle, hop, fly, flutter,
  swim, slither, crawl, pulse).
- **Worlds** (`src/art/scenes/*.ts`) are layered SVG landscapes built from a prop library; night
  colours are derived automatically, with per-world tweaks (glowing windows, fireflies, moonlight).
- **Sounds** (`src/audio/recipes/*.ts`) are synthesised live with the Web Audio API. The animal's
  name is spoken afterwards (can be turned off in settings).

Only one animal walks at a time: starting a walk stops the previous one, and the animation loop only
runs while something is walking.

### Adding an animal

Create `src/art/animals/<id>.ts` exporting an `AnimalDef` (see `lion.ts`), preview it with
`npm run art:preview -- <id>`, add a sound in `src/audio/recipes/<id>.ts`, and list it in a world's
`defaults` if it should appear there from the start. New files are picked up automatically.
