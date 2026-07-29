# Fonts

The site is wired for two licensed typefaces. Neither can be redistributed, so
the files are not in this repo — drop your webfont kits here and uncomment the
matching `url()` line in `src/styles/main.css` (top of the file, `@font-face`).

| Role                 | Typeface      | Foundry / seller                | Expected file                |
| -------------------- | ------------- | ------------------------------- | ---------------------------- |
| Everything           | Volta Regular | URW / Bauer, sold via MyFonts   | `volta-regular.woff2`        |
| Highlights, keywords | Rocket Script | Font Diner (Stuart Sandler)     | `rocket-script.woff2`        |

Buy the **webfont** licence, not just desktop. A desktop licence does not cover
`@font-face` on a public site, and Rocket Script's free download is personal use
only, which this site is not (it advertises Orion Automation).

Convert an `.otf`/`.ttf` to `.woff2` with
[fonttools](https://github.com/fonttools/fonttools): `fonttools ttLib.woff2 compress Volta-Regular.otf`.

## Until the files land

Free stand-ins are doing the work, loaded from Google Fonts in every page head:

| Slot   | Stand-in       | Why                                             |
| ------ | -------------- | ----------------------------------------------- |
| Volta  | **Zilla Slab** | 1950s advertising slab, holds up at text sizes  |
| Rocket | **Yellowtail** | retro sign script, same bounce                  |

Both real faces sit ahead of the stand-ins in `--font-display`, `--font-body`
and `--font-script`, so dropping the licensed files in makes them win with no
other edit. To retire a stand-in entirely, delete it from the stack in
`:root` and from the `fonts.googleapis.com` link in the five page heads.

## Where the script face is used

`src/styles/main.css`, the SCRIPT ACCENT block: `.script`, `<em>` inside article
bodies, ledes and hero tags, `<mark>` search hits, page kickers, and the footer's
closing line. Wrap any word in `<span class="script">word</span>` to give it the
accent face.

Article subheads (`.article-body h3`) stay on the slab on purpose. A reader
meets a dozen of them in one post and the script stops being readable at that
rate, so weight and the red bar carry the hierarchy there instead.
