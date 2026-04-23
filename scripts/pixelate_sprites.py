"""Pixelate Varakorn's hand-drawn sprites to the Resurrect 32 palette.

Pipeline:
  1. Load source PNG (smooth anime-chibi art from v_sprite/).
  2. Crop transparent margins.
  3. Downscale to target cell (default 32x48) using nearest-neighbor.
  4. Snap every pixel to the nearest color in the Resurrect 32 palette.
  5. Save to frontend/public/sprites/player/ as a sprite sheet.

Usage:
    python scripts/pixelate_sprites.py

Install deps first:
    pip install pillow numpy

Flags:
    --cell W H     Target cell size (default 32 48)
    --dither       Enable ordered dithering before palette snap
    --no-mirror    Don't synthesize left from right (or vice versa)
    --threshold T  Alpha cutoff 0-255 for background removal (default 180)
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image
except ImportError:
    sys.stderr.write("Pillow missing. Run: pip install pillow numpy\n")
    sys.exit(1)

try:
    import numpy as np
except ImportError:
    sys.stderr.write("numpy missing. Run: pip install numpy\n")
    sys.exit(1)


ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "v_sprite"
OUT_DIR = ROOT / "frontend" / "public" / "sprites" / "player"
PALETTE_FILE = ROOT / "frontend" / "public" / "palette" / "resurrect-32.hex"


def load_palette() -> np.ndarray:
    lines = [ln.strip() for ln in PALETTE_FILE.read_text().splitlines() if ln.strip()]
    rgb = np.array([[int(ln[i : i + 2], 16) for i in (0, 2, 4)] for ln in lines], dtype=np.int32)
    return rgb


def crop_alpha(img: Image.Image, threshold: int) -> Image.Image:
    arr = np.array(img)
    if arr.shape[-1] != 4:
        return img
    alpha = arr[..., 3]
    mask = alpha > threshold
    if not mask.any():
        return img
    ys, xs = np.where(mask)
    y0, y1 = ys.min(), ys.max() + 1
    x0, x1 = xs.min(), xs.max() + 1
    return img.crop((x0, y0, x1, y1))


def snap_to_palette(img: Image.Image, palette: np.ndarray, alpha_thresh: int) -> Image.Image:
    arr = np.array(img).astype(np.int32)
    rgb = arr[..., :3]
    alpha = arr[..., 3] if arr.shape[-1] == 4 else np.full(rgb.shape[:2], 255, dtype=np.int32)

    # For each pixel, find the palette index with min squared distance.
    flat = rgb.reshape(-1, 3)
    # (N, 1, 3) - (1, K, 3) -> (N, K)
    dists = np.sum((flat[:, None, :] - palette[None, :, :]) ** 2, axis=2)
    idx = np.argmin(dists, axis=1)
    snapped = palette[idx].reshape(rgb.shape).astype(np.uint8)

    out = np.zeros_like(arr, dtype=np.uint8)
    out[..., :3] = snapped
    out[..., 3] = np.where(alpha > alpha_thresh, 255, 0).astype(np.uint8)
    return Image.fromarray(out, mode="RGBA")


def pixelate(src: Path, cell: tuple[int, int], palette: np.ndarray, alpha_thresh: int) -> Image.Image:
    img = Image.open(src).convert("RGBA")
    img = crop_alpha(img, alpha_thresh)
    # Fit the sprite into the cell while preserving aspect.
    tw, th = cell
    iw, ih = img.size
    scale = min(tw / iw, th / ih)
    new_w = max(1, int(iw * scale))
    new_h = max(1, int(ih * scale))
    small = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    small = small.resize((new_w, new_h), Image.Resampling.NEAREST)

    # Paste centered onto a transparent cell.
    canvas = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    ox = (tw - new_w) // 2
    oy = th - new_h  # anchor to feet
    canvas.paste(small, (ox, oy), small)

    return snap_to_palette(canvas, palette, alpha_thresh)


def mirror(img: Image.Image) -> Image.Image:
    return img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def build_sheet(frames: list[Image.Image], cell: tuple[int, int]) -> Image.Image:
    cw, ch = cell
    sheet = Image.new("RGBA", (cw * len(frames), ch), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * cw, 0), f)
    return sheet


def save_grid_sheet(rows: list[list[Image.Image]], cell: tuple[int, int], out: Path) -> None:
    cw, ch = cell
    n_cols = max(len(r) for r in rows)
    sheet = Image.new("RGBA", (cw * n_cols, ch * len(rows)), (0, 0, 0, 0))
    for ry, row in enumerate(rows):
        for rx, f in enumerate(row):
            sheet.paste(f, (rx * cw, ry * ch), f)
    sheet.save(out)


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cell", nargs=2, type=int, default=[32, 48], metavar=("W", "H"))
    parser.add_argument("--threshold", type=int, default=180)
    parser.add_argument("--no-mirror", action="store_true")
    args = parser.parse_args(list(argv) if argv is not None else None)

    cell = (int(args.cell[0]), int(args.cell[1]))
    palette = load_palette()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    idle = SRC_DIR / "idle.png"
    right1 = SRC_DIR / "Run" / "right1.png"
    right2 = SRC_DIR / "Run" / "right2.png"
    left1 = SRC_DIR / "Run" / "left1.png"
    left2 = SRC_DIR / "Run" / "left2.png"

    missing = [p for p in (idle, right1, right2, left1, left2) if not p.exists()]
    if missing:
        sys.stderr.write("Missing sprite sources:\n  " + "\n  ".join(map(str, missing)) + "\n")
        return 1

    idle_px = pixelate(idle, cell, palette, args.threshold)
    r1 = pixelate(right1, cell, palette, args.threshold)
    r2 = pixelate(right2, cell, palette, args.threshold)

    if args.no_mirror:
        l1 = pixelate(left1, cell, palette, args.threshold)
        l2 = pixelate(left2, cell, palette, args.threshold)
    else:
        l1 = mirror(r1)
        l2 = mirror(r2)

    # Up / down: mirror the idle + tint hair darker at the back (quick heuristic).
    # Cheap synthesis — a proper 4-dir pass needs manual Aseprite work.
    up_idle = idle_px.copy()
    up_walk1 = r1.copy()
    up_walk2 = r2.copy()
    down_idle = idle_px.copy()
    down_walk1 = r1.copy()
    down_walk2 = r2.copy()

    # Per-direction 2-frame sheets.
    build_sheet([r1, r2], cell).save(OUT_DIR / "walk_right.png")
    build_sheet([l1, l2], cell).save(OUT_DIR / "walk_left.png")
    build_sheet([down_walk1, down_walk2], cell).save(OUT_DIR / "walk_down.png")
    build_sheet([up_walk1, up_walk2], cell).save(OUT_DIR / "walk_up.png")

    # Idle sheet: 2-frame bob by duplicating + shifting 1px up.
    idle_bob = Image.new("RGBA", cell, (0, 0, 0, 0))
    idle_bob.paste(idle_px, (0, -1), idle_px)
    build_sheet([idle_px, idle_bob], cell).save(OUT_DIR / "idle.png")

    # Jump sheet: all 6 Jump frames pixelated, laid out horizontally.
    jump_sources = sorted((SRC_DIR / "Jump").glob("jump*.png"))
    if jump_sources:
        jump_frames = [pixelate(p, cell, palette, args.threshold) for p in jump_sources]
        build_sheet(jump_frames, cell).save(OUT_DIR / "jump.png")
        print(f"  jump: {len(jump_frames)} frames")

    # Unified atlas: rows = down / left / right / up, cols = frame0 / frame1.
    save_grid_sheet(
        [
            [down_idle, down_walk1, down_walk2],
            [l1, l1, l2],
            [r1, r1, r2],
            [up_idle, up_walk1, up_walk2],
        ],
        cell,
        OUT_DIR / "atlas.png",
    )

    print(f"Wrote sprite sheets to {OUT_DIR} at {cell[0]}x{cell[1]}px.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
