# DigiZoo

A sticker-book PWA for babies and kids. Pick a world — Pets, Farm, Forest, Bugs, Birds, Safari,
Jungle, Rainforest, Desert, Australia & NZ, Arctic & Antarctic, Ocean, Cave, Dinosaurs,
Transportation, Space, My Body, Halloween or Bible — then play with 250 cute stickers: drag, pinch
to scale and rotate, flip, duplicate, layer, delete, tap ▶ to hear its real sound, 🐾 to make it
walk, swim, hop, fly or drive a few steps (it turns around before leaving the screen), 🍽 to feed it
— meat makes the lion happy, carrots make it sad — and ⓘ to read (or hear) what it is, three fun
facts and what it likes to eat. Tap the sun, clouds, trees, the windmill, the traffic lights and
other things in the background and they react. Play the matching-card game (3×3, 4×4 or 5×5) with the stickers of a world. Toggle
day and night, zoom and pan around, switch between 16 languages (names and facts are spoken in the
chosen language), and start over whenever you like. Everything is saved on the device and works
offline once installed.

## Install it on a phone or tablet

DigiZoo is a Progressive Web App: open **https://ckangnz.github.io/DigiZoo/** once and add it to your
home screen. It then opens full screen like a normal app and works without internet. The app also has a
step-by-step guide under **Settings → Install app** (and on the world picker).

**iPhone and iPad (Safari)**

1. Open the link in **Safari**.
2. Tap the **Share** button (the square with an arrow).
3. Tap **Add to Home Screen**, then **Add**.

**Android (Chrome)**

1. Open the link in **Chrome**.
2. Tap the menu **⋮** at the top right.
3. Tap **Install app** (or **Add to Home screen**), then **Install**.

**Computer (Chrome or Edge)**

1. Open the link in **Chrome** or **Edge**.
2. Click the install button at the right of the address bar, or open the menu and choose
   **Install DigiZoo**.

Updates arrive automatically: when a new version is published, the app picks it up the next time it is
opened (close it and open it again if you still see the old one).

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
| `npm run audio:check` | Render every synthesised sound offline and check levels                                |
| `npm run credits`     | Regenerate `CREDITS.md` from the sound credit files                                    |

Real recordings are fetched and processed with the scripts in `scripts/sounds/` (Wikimedia Commons
search with licence filtering, a reproducible spec per clip in `scripts/sounds/specs/`, review sheets).

## Deploy to GitHub Pages

1. Push the repo to GitHub.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds with the right base path
   (`/<repo>/`, or `/` for a `<user>.github.io` repo) and publishes it.

## How it is made

There are no image files. Everything visual is generated from code:

- **Stickers** (`src/art/animals/*.ts`, listed in `src/registry/roster.ts`) are rigged vector drawings:
  a tree of parts (body, legs, head, tail…) with pivots. `src/art/core/render.ts` turns each one into
  an SVG sticker with a white die-cut border in three finishes — **cartoon**, **comic** (ink + halftone)
  and **painted** (texture filters). `src/art/core/motion.ts` animates the parts for each way of moving
  (walk, waddle, hop, fly, flutter, swim, slither, crawl, pulse, float, beat, breathe, wobble, roll).
- **Worlds** (`src/art/scenes/*.ts`) are layered SVG landscapes built from a prop library; night
  colours are derived automatically. `interactives` are props drawn as their own layer so they can
  react when tapped (spin, shake, bounce, glow… with leaves, rain, splashes, coins and other effects).
- **Sounds**: real recordings in `src/audio/samples/` (licensed CC0 / public domain / CC BY / CC BY-SA,
  credited in [CREDITS.md](CREDITS.md) and in the app's settings), with synthesised Web Audio recipes
  (`src/audio/recipes/*.ts`) for everything else. The name is spoken afterwards (toggle in settings).
- **Food** (`src/food/`): 14 foods and what each creature likes to eat.
- **Facts** (`src/info/<lang>/<world>.ts`): a short description and three facts for every sticker,
  loaded on demand per language and cached by the service worker when first read.
- **Matching game** (`src/game/`, `src/ui/MatchGame.tsx`): odd grids get a free star card in the middle.
- **Languages** (`src/i18n/`): English plus 15 translations, loaded on demand.

Only one animal walks at a time: starting a walk stops the previous one, and the animation loop only
runs while something is walking.

### Adding an animal

Add it to `src/registry/roster.ts`, create `src/art/animals/<id>.ts` exporting an `AnimalDef` (see
`lion.ts`), preview it with `npm run art:preview -- <id>`, add a sound (`src/audio/samples/<id>.mp3` +
`<id>.json` credit, or a recipe in `src/audio/recipes/<id>.ts`), a diet in `src/food/diets.ts`, its
name in each `src/i18n/locales/*.ts`, its card in each `src/info/<lang>/<world>.ts`, and list it in a
world's `defaults` if it should appear there from the start. The unit tests check that nothing is
missing.
