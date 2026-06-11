# Varakorn — Portfolio v2

Aesthetic-first 3D portfolio. Warm beige paper, 2020-anime mood, three.js dioramas as the
centerpiece. No backend, no framework — Vite + vanilla JS + three.js, deployable anywhere static.

## Pages

| Page | File | 3D scene |
| --- | --- | --- |
| Home | `index.html` | Lo-fi desk diorama with **diegetic navigation** — the monitor, book stack, and torii gate are clickable doors to Experience / Blog / Journey (pin labels mark them); other objects tell stories on hover/tap |
| Journey | `journey.html` | Floating vermilion torii over stepping stones |
| Experience + Goals | `experience.html` | Retro camera with orbiting photo frames |
| Blog | `blog.html` | Open book shedding serif glyphs |

The hero camera is fixed and composed — gentle pointer parallax only, no free orbit. The top
navbar remains as the conventional backup. To verify visually:
`node scripts/screenshot.mjs` (dev server must be running; drives system Edge headless, also
click-tests the 3D navigation).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview  # serve the production build
```

## Editing content

Everything written lives in [`src/js/data.js`](src/js/data.js) — profile, stats, socials,
projects, services, the journey timeline, experience entries, skills, goals, and full blog posts.
Edit it, save, refresh. The four HTML files only hold page scaffolding and the static
about/contact prose.

Design tokens (colors, fonts, spacing) are the `:root` block at the top of
[`src/styles/main.css`](src/styles/main.css).

3D scenes live in `src/js/three/` — `core.js` (shared stage, toon materials, dust, outlines,
parallax/spin controllers), `objects.js` (shared torii + camera builders), `heroScene.js`
(the desk + diegetic nav), `accentScenes.js` (torii / camera / book headers).

## Aesthetic rules

- Palette: paper `#F3EBDD`, ink `#322A20`, hanko red `#BF4427`, gold/matcha accents. No gradients,
  no glassmorphism, no purple.
- Type: Shippori Mincho B1 (display) + Zen Kaku Gothic New (body).
- 3D: MeshToonMaterial + inverted-hull outlines, beige fog melting into the page, blob shadows —
  no PBR, no postprocessing.
- Texture: SVG-noise paper grain overlay, hairline rules, hanko seal mark, polaroid frames
  with tape. English-only copy — the vibe carries through palette, type, and texture.
- Motion: curtain page transitions, elastic pop-in for 3D objects, scroll reveals.
  `prefers-reduced-motion` disables 3D mounting, the custom cursor, and transitions.

## Deploy (Vercel)

Static site — import the repo, framework preset "Vite", build `npm run build`, output `dist`.
No environment variables needed.

## Assets

- `public/photos/avatar.png` — chibi portrait (hero of the About section)
- `public/photos/gamuda-graduation.jpg` — graduation speech photo (Journey, chapter 4)
- `public/Varakorn_Resume_2026.pdf` — downloadable resume
