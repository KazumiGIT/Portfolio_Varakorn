# Site rules — read before editing

Standing rules from the owner (Varakorn). These outlive any chat session; follow them on every change.

## Linking

- **Interlink pages as much as reasonably possible** — every page should weave links to related pages (experience detail pages, journey, blog, contact). This is deliberate SEO/AEO internal-linking strategy. But keep it **moderate**: links must read naturally in the copy, never stuffed.
- **Internal links always open in the same tab.** Never put `target="_blank"` on a link to another page of this site — the user should move through the site in one tab, not get scattered across tabs.
- External links (WhatsApp, client sites, socials) keep `target="_blank" rel="noopener noreferrer"`.
- One exception: the resume PDF (`/Varakorn_Resume_2026.pdf`) opens in a new tab — it is a file, not a page, and same-tab would strand the visitor outside the site chrome.

## Copy

- **No hyphens or em dashes in visible copy** — the owner wants dash-free text ("avoids AI feels"). Rewrite around them.
- Display name is **"Varakorn" only** in all visible text. The legal full name (Varakorn Meunukdomn) may appear in schema/JSON-LD metadata but never on the page. **One owner approved exception (31 Aug 2026):** the legal name appears once on `/privacy` ("Who runs this site") and once on `/terms` ("What this site is"), because a legal document names its operator. Nowhere else.
- The AI video editing system built at P10X Media (with Claude) is **private and confidential** — mention it exists, never publish how it works.
- Facts only: never guess dates, titles, locations, or counts. If a fact is unknown, ask the owner instead of inventing it.

- **No trackers.** The Google Ads tag (AW-18380931193) was removed 31 Aug 2026 at the owner's decision; the site has no analytics and no advertising cookies, and `/privacy` promises exactly that. Adding any tracker back means updating `/privacy` in the same change.

## Known facts that pages must not contradict

- Owner is based in **Subang Jaya, Selangor** (never Shah Alam).
- P10X Media = marketing department of P10X, located in **Sunway, Subang Jaya**. Role title: AI Specialist (owner's own framing: "Full Stack AI Engineer").
- Owner's first 3M Pro Shop blog article is `self-healing-ppf-vs-self-healing-coating` — articles from it onward are his; the Proton eMAS 7 article is **not** his.
- Orion Automation was registered **November 2025** (two months after leaving HYGR, before the Python bootcamp and Gamuda) — not 2026. It has **zero revenue to date**; the owner tells this honestly on the site. Its domain runs until November 2026. Never present Orion as a revenue-generating business.
- Experience order (newest first): P10X Media, Gamuda AI Academy, Python Bootcamp, Orion Automation, HYGR, College Pasir Salak. Cards numbered 001 (College) to 006 (P10X).
- Python Bootcamp = **JomHack Free Python Bootcamp**, Dec 2025 cohort, found via **Mr Inbaraj's TikTok lives** (tiktok.com/@inbaraj.s) — credit him respectfully. It led to Gamuda AI Academy (GAIA), fully sponsored by **Yayasan Gamuda only** (do NOT credit Gamuda or Google Cloud as sponsors); owner passed the coding assessment with only a Cert in IT.
- HYGR: joined as **Video Editor intern Jan 2024** (loophole: IT student with one multimedia class + college club videos as portfolio), **full time June 2024**, grew into Content Creator, left Aug 2025. Commuted Cheras→Subang as intern, then moved to Subang Jaya. Bosses: Ivor (creative, 24/7 mind) and Boss Meng (calm, quiet; source of the "be proud of your work" lesson) — deeper boss details are P&C, don't publish. Best senior/editor: Alia — but do NOT name her on the site; write "my editing senior" instead (owner's request). Long hours (8.30am–9pm/12am) were his OWN initiative — never frame as employer demand. Highlights: caravan CSR trip to Orang Asli in Pahang, nationwide booth pop ups with ZUS. Quitting felt "worse than a breakup but also the freest".
- Gamuda AI Academy: Cohort 5, KL Campus, Jan–Mar 2026, 9am–12pm classes + 1pm–5pm capstone; Full Stack Dev + AI Engineer fundamentals (AI Engineer ≠ ML Engineer). Team = **JAAVIS** (Jason, Alan, Adam, Varakorn, Irfan, Shasha), owner was youngest + team lead. Only 2 of 7 teams presented to YB Datuk Chang Lih Kang (MOSTI); Team 2 won 1st for the FINAL DAY capstone demo presentation (not the MOSTI one). Second YB he spoke with (first: YB Syed Saddiq, during HYGR). Key mentors quoted on site: Meng (ex HYGR boss) and Mr Johan Nasir.
- "Figma Weavy" is one product name (not Figma + Weavy). Astro is "soon to be used" at P10X, not in use yet.

## Machine readability (do not regress this)

- `/home`, `/journey`, `/experience` and `/blog` paint themselves from `src/js/data.js` after the bundle loads. A crawler that does not run JavaScript would see empty shells, so the `prerenderForCrawlers()` plugin in `vite.config.js` bakes the same words into the HTML at build time and adds the matching JSON-LD. The page scripts overwrite those containers on hydrate, so a human visitor sees no difference.
- The plugin finds its targets by the empty `<div data-cards></div>` style containers. **If you rename or pre fill one of those containers, the plugin warns in the build log and that page silently goes back to being invisible to AI.** Run `npm run check:seo` (dev server up) after touching them.
- Blog articles live at `/blog#slug` and their full text ships in the HTML. That is deliberate: it is what an answer engine can quote.
- `public/llms.txt` is the hand written summary for AI crawlers. Update it when a role, a page, or a headline fact changes.
- `/contact` is `noindex` on purpose (it carries a phone number and an email) and is deliberately left out of `sitemap.xml`. Keep those two facts in step.

## Accounts (Supabase)

- Identity is **Supabase Auth** (project ref `pwiztuhqaluihtrtzydj`, Singapore): email + password and Google, via the site wide dialog in `src/js/authui.js`. The old hand rolled Google one tap + HMAC cookie (`api/auth.js`, `api/_lib/auth.js`, `api/_lib/guestbook.js`) is deleted; do not resurrect it.
- Data flows through five Vercel functions only: `api/comments.js`, `api/like.js`, `api/testimonials.js`, `api/me.js`, `api/chat.js` (Vercel hobby caps at 12). All use `api/_lib/store.js` (Postgres over the transaction pooler) + `api/_lib/supauth.js` (Bearer token verified against Supabase). Tables have RLS on with **no policies on purpose**: PostgREST is a locked door, the functions are the only way in.
- The desk terminal is **account only** (owner's decision, reaffirmed 31 Aug 2026 over Claude's 3 free questions suggestion): anonymous POSTs get the gate message and Gemini is never called. Signed in visitors get stored chat history. Comments and vouches are moderated: `npm run comments pending` then `approve <id>` / `approve-t <id>`.
- Passport stamps come from `experience[].page` and reading marks from `posts[].slug` in data.js, validated server side. A new chapter or note is automatically collectable. The reading progress ring was removed from `/account` on 1 Sep 2026 at the owner's request: the marks are still recorded, nothing shows them.
- The home wall (`src/js/wall.js`) also composes: its invitation card opens a dialog where a visitor picks **one or more** chapters or notes as chips, and the same words post once per picked page.
- `/account` is noindex and stays out of the sitemap. It also edits the profile: display name, photo, title, bio and up to five links live on the **Supabase auth user** (`user_metadata.full_name` / `avatar_url` / `title` / `bio` / `links`), and `POST /api/me {sync:true}` mirrors them onto the `profiles` row that comments join against. Photos go to the public `avatars` bucket, one folder per uid, policies in `db/storage.sql`.
- Title, bio and links are **public**: they show on the profile card (`src/js/profilecard.js`) when someone clicks a name in the guestbook or vouches, and `/privacy` discloses them. Links are validated server side in `supauth.js` (https only, max 5).
- The account page must NOT do a full reload on every auth event: Supabase fires one for a metadata change too, and that would wipe the form doing the editing. It reloads only when the user id changes.
- **Linking a second sign in method needs "Manual linking" enabled** in Supabase (Authentication -> Sign In / Up). While it is off the Connect button explains itself instead of failing silently.
- `npm run check:account`, `check:signin` and `check:profile` are the end to end tests (each restores the test user's state so they run in any order). check:account is the broad one (self provisions a confirmed `e2e-tester@example.com` user via the admin API; delete it after big test sessions so the public site never shows Test Tanuki).
- Supabase email confirmation: the free tier built in mailer is heavily rate limited. Owner was advised to turn OFF "Confirm email" (Authentication -> Sign In / Up) until real SMTP exists.

## Adding a page (checklist)

1. Create the `.html` (copy the nav + mobile menu markup from an existing page — it is duplicated per page, including the Experience dropdown).
2. Add it to `PAGES` and `rollupOptions.input` in `vite.config.js`.
3. Add it to `public/sitemap.xml` (canonical host: `https://www.varakorn.me`).
4. Give it canonical + og tags and a JSON-LD block; validate the JSON parses.
5. `npm run build` before committing; verify visually with a screenshot script when the change is visual.
