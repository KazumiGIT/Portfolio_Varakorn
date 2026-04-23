# Varakorn — Dungeon Portfolio

A 2D top-down dungeon-explorer portfolio. Stardew Valley meets Hyper Light Drifter meets Undertale. Built as an indie retro pixel-art web game — 32-color palette, stepped animations, CRT scanlines, torch-lit fog-of-war.

**Stack:** Vite + React 18 + TypeScript + Tailwind + Zustand + Framer Motion · FastAPI + Pydantic v2 + Resend · Python sprite pipeline (Pillow + numpy).

## Project layout

```
portfolio/
├── frontend/          Vite + React client (the game)
├── backend/           FastAPI + Pydantic (portfolio + contact form)
├── scripts/
│   └── pixelate_sprites.py   one-shot sprite pixelator
├── v_sprite/          source art (smooth chibi) — input to pixelator
└── README.md
```

## Quick start

### 1. Pixelate sprites (first run only)

The dungeon player is built from your hand-drawn chibi art in `v_sprite/`. The pipeline downscales to 32x48 and snaps every pixel to the Resurrect 32 palette.

```bash
pip install pillow numpy
python scripts/pixelate_sprites.py
```

Outputs `frontend/public/sprites/player/*.png`. Re-run after editing `v_sprite/`.

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # fill RESEND_API_KEY if you want real email
uvicorn app.main:app --reload --port 8000
```

Endpoints:
- `GET  /api/health`
- `GET  /api/floors`, `GET /api/floors/{id}`
- `GET  /api/projects`
- `GET  /api/skills`
- `POST /api/contact` — rate-limited 3 per 10 min / IP, honeypot-protected

Docs: `http://localhost:8000/docs`. Without `RESEND_API_KEY`, submissions are logged only.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` → `localhost:8000`.

## Controls

| Action | Key |
|---|---|
| Move | WASD / Arrows |
| Interact | E / Space / Enter |
| Close dialog | ESC |
| Click-to-move | Mouse (A* pathfinding) |
| Text resume (accessibility) | "TEXT RESUME" button, top-right |
| Mute SFX | "♪" toggle, top-right |

Mobile: on-screen D-pad (bottom-left) + interact button (bottom-right).

## Aesthetic rules (enforced by code and Tailwind config)

- Internal render target: **320x180**, integer-scaled to viewport
- Tiles: **16x16**, divs + `image-rendering: pixelated`
- Sprites: 32x48, nearest-neighbor, palette-snapped to Resurrect 32
- Animations: frame-by-frame, **stepped easing only** (no smooth lerps)
- Fonts: Press Start 2P (headers) + VT323 (dialog/body) — pixel-only
- UI: **no rounded corners**, no gradients (except torch light), no modern shadows — 9-slice borders on dialog boxes
- Overlays: CRT scanlines (~50% mixed multiply) + vignette + subtle chromatic aberration

## Dungeon floors

1. **The Archives** 📚 — Kolej Komuniti cert, Gamuda AI Academy, Minister's pedestal (playable reference)
2. **The Echo Chamber** 📢 — HYGR / 38M+ views / viral campaign (coming in next milestone)
3. **The Forge** 🔨 — Tendervise AI / Abang Mystery / Health Monitor + skill runes (coming next)
4. **The Throne Room** 👑 — Orion Automation banner + Crystal Ball contact form (coming next)

## Deployment

**Frontend → Vercel**

```bash
cd frontend
npm run build
# Push to GitHub; import in Vercel dashboard.
# Set env: VITE_API_URL=https://<your-railway-backend>/api
```

**Backend → Railway**

1. Create a new Railway project from the `backend/` directory.
2. Set env vars: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `CORS_ORIGINS=["https://<your-vercel>.vercel.app"]`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

## Editing content without code

All dungeon copy (floor theming, pedestal titles, project bodies, skills, gating) lives in `backend/app/data/portfolio.json`. Change it, restart uvicorn, refresh the game — no frontend rebuild needed.

## Audio

SFX files belong at `frontend/public/audio/*.wav` (names: `click`, `interact`, `dialog-open`, `dialog-beep`, `footstep`, `door-open`, `portal`, `contact-send`). Drop in CC0 files (Kenney UI + Kenney RPG). Missing files silently no-op — the game keeps running.

BGM is not shipped. When you pick your YouTube Music playlist, we'll wire Howler to a streamable source.

## Regenerating sprites

If you add up/down walk frames to `v_sprite/`, edit `scripts/pixelate_sprites.py` to load them and rerun:

```bash
python scripts/pixelate_sprites.py
```

For true 4-direction animation, swap the mirrored `up` / `down` rows for hand-drawn variants.
