# Site rules — read before editing

Standing rules from the owner (Varakorn). These outlive any chat session; follow them on every change.

## Linking

- **Interlink pages as much as reasonably possible** — every page should weave links to related pages (experience detail pages, journey, blog, contact). This is deliberate SEO/AEO internal-linking strategy. But keep it **moderate**: links must read naturally in the copy, never stuffed.
- **Internal links always open in the same tab.** Never put `target="_blank"` on a link to another page of this site — the user should move through the site in one tab, not get scattered across tabs.
- External links (WhatsApp, client sites, socials) keep `target="_blank" rel="noopener noreferrer"`.
- One exception: the resume PDF (`/Varakorn_Resume_2026.pdf`) opens in a new tab — it is a file, not a page, and same-tab would strand the visitor outside the site chrome.

## Copy

- **No hyphens or em dashes in visible copy** — the owner wants dash-free text ("avoids AI feels"). Rewrite around them.
- Display name is **"Varakorn" only** in all visible text. The legal full name (Varakorn Meunukdomn) may appear in schema/JSON-LD metadata but never on the page.
- The AI video editing system built at P10X Media (with Claude) is **private and confidential** — mention it exists, never publish how it works.
- Facts only: never guess dates, titles, locations, or counts. If a fact is unknown, ask the owner instead of inventing it.

## Known facts that pages must not contradict

- Owner is based in **Subang Jaya, Selangor** (never Shah Alam).
- P10X Media = marketing department of P10X, located in **Sunway, Subang Jaya**. Role title: AI Specialist (owner's own framing: "Full Stack AI Engineer").
- Owner's first 3M Pro Shop blog article is `self-healing-ppf-vs-self-healing-coating` — articles from it onward are his; the Proton eMAS 7 article is **not** his.
- Orion Automation was registered **November 2025** (two months after leaving HYGR, before the Python bootcamp and Gamuda) — not 2026. It has **zero revenue to date**; the owner tells this honestly on the site. Its domain runs until November 2026. Never present Orion as a revenue-generating business.
- "Figma Weavy" is one product name (not Figma + Weavy). Astro is "soon to be used" at P10X, not in use yet.

## Adding a page (checklist)

1. Create the `.html` (copy the nav + mobile menu markup from an existing page — it is duplicated per page, including the Experience dropdown).
2. Add it to `PAGES` and `rollupOptions.input` in `vite.config.js`.
3. Add it to `public/sitemap.xml` (canonical host: `https://www.varakorn.me`).
4. Give it canonical + og tags and a JSON-LD block; validate the JSON parses.
5. `npm run build` before committing; verify visually with a screenshot script when the change is visual.
