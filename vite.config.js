import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/* Vite bundles this config into node_modules/.vite-temp before running it, so a
   plain relative import() of an api/ handler resolves against that temp folder
   and blows up. Always go through the project root. */
const fromRoot = (p) => pathToFileURL(resolve(process.cwd(), p)).href;

const PAGES = [
  'home',
  'journey',
  'experience',
  'blog',
  'contact',
  'privacy',
  'terms',
  'account',
  'experience/ai-specialist-p10x-media',
  'experience/orion-automation-founder',
  'experience/gamuda-ai-academy',
  'experience/jomhack-python-bootcamp',
  'experience/hygr-content-creator',
  'experience/college-community-pasir-salak',
];

/** Serve clean URLs (/journey -> journey.html) in dev & preview, matching
    Vercel's cleanUrls behavior in production. "/" serves the home page. */
function cleanUrls() {
  const rewrite = (req, _res, next) => {
    const [path, query] = req.url.split('?');
    const clean = path.replace(/\/+$/, '');
    const name = clean.slice(1);
    if (path === '/' || name === 'index') {
      req.url = '/home.html' + (query ? `?${query}` : '');
    } else if (PAGES.includes(name)) {
      req.url = `/${name}.html` + (query ? `?${query}` : '');
    }
    next();
  };
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

/** Dev twins of the guestbook Vercel functions (api/auth.js, api/comments.js,
    api/like.js). The handlers are written to run both on Vercel and as plain
    connect middleware, so they mount directly. Env comes from .env. */
function guestbookDev(env) {
  const mount = (server) => {
    const KEYS = [
      'DATABASE_URL',
      'SUPABASE_URL',
      'SUPABASE_PUBLISHABLE_KEY',
      'SUPABASE_SECRET_KEY',
      'GEMINI_API_KEY',
      'GEMINI_MODEL',
    ];
    for (const k of KEYS) {
      if (env[k] && !process.env[k]) process.env[k] = env[k];
    }
    for (const [route, mod] of [
      ['/api/comments', 'api/comments.js'],
      ['/api/like', 'api/like.js'],
      ['/api/testimonials', 'api/testimonials.js'],
      ['/api/me', 'api/me.js'],
      ['/api/chat', 'api/chat.js'],
    ]) {
      server.middlewares.use(route, (req, res) =>
        import(fromRoot(mod))
          .then((m) => m.default(req, res))
          .catch((e) => {
            // a dead handler must not take the whole dev server down with it
            console.error(`[dev] ${route} failed:`, e.message);
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: 'dev handler failed' }));
          })
      );
    }
  };
  return { name: 'guestbook-dev', configureServer: mount, configurePreviewServer: mount };
}

/* ---------------------------------------------------------------------------
   Prerender for machines.

   /journey, /experience and /blog paint themselves from src/js/data.js after
   the bundle loads. A browser sees the full page; a crawler that does not run
   JavaScript (most AI answer engines do not) sees three near empty shells. So
   bake the same words into the HTML here, at build time, together with the
   JSON-LD that describes them. The page scripts overwrite these containers on
   hydrate, so nothing changes for a human visitor. Runs in dev too, so what
   you check locally is what ships.
--------------------------------------------------------------------------- */
const SITE = 'https://www.varakorn.me';
const PERSON = `${SITE}/#varakorn`;

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** strip tags so a post body can go into a plain text JSON-LD field */
const plain = (html) =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ld = (graph) =>
  `<script type="application/ld+json">\n${JSON.stringify(
    { '@context': 'https://schema.org', '@graph': graph },
    null,
    2
  )}\n  </script>\n  `;

function prerenderForCrawlers() {
  return {
    name: 'prerender-for-crawlers',
    async transformIndexHtml(html, ctx) {
      const page = (ctx.path || ctx.filename || '')
        .replace(/^.*[\\/]/, '')
        .replace(/\.html$/, '');
      const data = await import(fromRoot('src/js/data.js'));
      const warn = (m) => console.warn(`\n[prerender] ${m}\n`);

      /** put `inner` inside the empty <div data-attr></div> that the page JS fills */
      const fill = (attr, inner) => {
        const re = new RegExp(`(<div[^>]*\\b${attr}\\b[^>]*>)(\\s*)(</div>)`);
        if (!re.test(html)) {
          warn(`no empty [${attr}] container in ${page}.html, nothing baked in`);
          return;
        }
        html = html.replace(re, `$1${inner}$3`);
      };
      const head = (block) => {
        html = html.replace('</head>', `  ${block}</head>`);
      };

      if (page === 'home') {
        fill(
          'data-values',
          data.valueCategories
            .map(
              (c) => `
          <article class="vcard">
            <span class="v-kicker">${esc(c.kicker)}</span>
            <h3 class="v-title">${esc(c.title)}</h3>
            <div class="v-num">${esc(c.stat.value)}${esc(c.stat.suffix)}</div>
            <div class="v-lbl">${esc(c.stat.label)}</div>
            <p class="v-story">${esc(c.story)}</p>
            <ul class="v-chips">${c.chips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          </article>`
            )
            .join('') + '\n        '
        );
        fill(
          'data-projects',
          data.projects
            .map(
              (x) => `
          <article class="proj-row">
            <h3 class="name">${esc(x.title)}</h3>
            <div class="kick">${esc(x.kicker)}</div>
            <p class="desc">${esc(x.description)}</p>
            <ul class="tags">${x.stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
            <p><a href="/experience">See the work &rarr;</a></p>
          </article>`
            )
            .join('') + '\n        '
        );
        fill(
          'data-services',
          data.services
            .map(
              (x) => `\n          <div class="svc"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`
            )
            .join('') + '\n        '
        );
        fill(
          'data-chapters',
          data.timeline
            .map(
              (t) => `
          <a class="chapter" href="/journey"><span class="chap-chip">${esc(t.chip)}</span><span class="yr">${esc(t.year)}</span><h3>${esc(t.title)}</h3><p>${esc(t.role)}</p></a>`
            )
            .join('') + '\n        '
        );
        head(
          ld([
            {
              '@type': 'ItemList',
              '@id': `${SITE}/home#services`,
              name: 'What Varakorn builds',
              numberOfItems: data.services.length,
              itemListElement: data.services.map((x, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'Service',
                  name: x.title,
                  description: x.body,
                  provider: { '@id': PERSON },
                  areaServed: { '@type': 'Country', name: 'Malaysia' },
                },
              })),
            },
            {
              '@type': 'ItemList',
              '@id': `${SITE}/home#projects`,
              name: 'Selected projects',
              numberOfItems: data.projects.length,
              itemListElement: data.projects.map((x, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'CreativeWork',
                  name: x.title,
                  headline: x.kicker,
                  description: x.description,
                  keywords: x.stack.join(', '),
                  author: { '@id': PERSON },
                  url: `${SITE}/experience`,
                },
              })),
            },
          ])
        );
      }

      if (page === 'journey') {
        fill(
          'data-timeline',
          data.timeline
            .map(
              (t) => `
          <article class="t-entry">
            <div class="meta"><span class="era-chip">${esc(t.chip)}</span><span>${esc(t.period)}</span></div>
            <h3>${esc(t.title)}</h3>
            <div class="role">${esc(t.role)}</div>
            <p class="story">${esc(t.story)}</p>${
              t.page
                ? `\n            <p><a class="link-u" href="${esc(t.page)}">Read the full chapter: ${esc(t.title)} &rarr;</a></p>`
                : ''
            }${
              t.photo
                ? `\n            <figure class="polaroid"><img src="${esc(t.photo)}" alt="${esc(t.photoCaption)}" loading="lazy" /><figcaption class="cap">${esc(t.photoCaption)}</figcaption></figure>`
                : ''
            }
          </article>`
            )
            .join('') + '\n        '
        );
        head(
          ld([
            {
              '@type': 'ItemList',
              '@id': `${SITE}/journey#chapters`,
              name: 'The six chapters of the journey',
              itemListOrder: 'https://schema.org/ItemListOrderAscending',
              numberOfItems: data.timeline.length,
              itemListElement: data.timeline.map((t, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: `${t.title} · ${t.role}`,
                description: t.story,
                ...(t.page ? { url: SITE + t.page } : {}),
              })),
            },
          ])
        );
      }

      if (page === 'experience') {
        fill(
          'data-cards',
          data.experience
            .map(
              (x) => `
          <article class="seed">
            <h3>${esc(x.role)} &middot; ${esc(x.org)}</h3>
            <p>${esc(x.period)} &middot; ${esc(x.place)}</p>
            <ul>${x.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>${
              x.page
                ? `\n            <p><a href="${esc(x.page)}">Full story: ${esc(x.org)} &rarr;</a></p>`
                : ''
            }
          </article>`
            )
            .join('') + '\n        '
        );
        fill(
          'data-skills',
          data.skills
            .map(
              (g) =>
                `\n          <div class="skill-cell"><h3>${esc(g.group)}</h3><ul>${g.items
                  .map((i) => `<li>${esc(i)}</li>`)
                  .join('')}</ul></div>`
            )
            .join('') + '\n        '
        );
        fill(
          'data-goals',
          data.goals
            .map(
              (g) => `\n          <div class="goal"><h3>${esc(g.title)}</h3><p>${esc(g.body)}</p></div>`
            )
            .join('') + '\n        '
        );
        fill(
          'data-langs',
          data.profile.languages.map((l) => `<span class="tag red">${esc(l)}</span>`).join('')
        );
      }

      if (page === 'blog') {
        const label = Object.fromEntries(data.postCategories.map((c) => [c.id, c.label]));
        const ordered = [...data.posts].sort((a, b) => (a.date < b.date ? 1 : -1));

        // the whole article, in the source, under the same /blog#slug anchor
        // the reader overlay uses. This is what an answer engine can quote.
        fill(
          'data-posts',
          ordered
            .map(
              (x) => `
          <article class="seed" id="${esc(x.slug)}">
            <h3><a href="/blog#${esc(x.slug)}">${esc(x.title)}</a></h3>
            <p class="seed-meta">
              <time datetime="${esc(x.date)}">${esc(x.dateLabel)}</time>
              &middot; ${esc(label[x.category] || x.category)}
              &middot; ${esc(x.minutes)} min read
              &middot; ${x.tags.map((t) => `#${esc(t)}`).join(' ')}
            </p>
            <p class="seed-excerpt">${esc(x.excerpt)}</p>
            <div class="seed-body">${x.body}</div>
          </article>`
            )
            .join('') + '\n        '
        );

        head(
          ld(
            ordered.map((x) => ({
              '@type': 'BlogPosting',
              '@id': `${SITE}/blog#${x.slug}`,
              mainEntityOfPage: `${SITE}/blog#${x.slug}`,
              url: `${SITE}/blog#${x.slug}`,
              headline: x.title,
              name: x.title,
              description: x.excerpt,
              articleSection: label[x.category] || x.category,
              keywords: x.tags.join(', '),
              datePublished: x.date,
              dateModified: x.date,
              inLanguage: 'en',
              wordCount: plain(x.body).split(' ').length,
              timeRequired: `PT${x.minutes}M`,
              ...(x.cover ? { image: SITE + x.cover } : {}),
              isPartOf: { '@id': `${SITE}/blog` },
              author: { '@id': PERSON },
              publisher: { '@id': PERSON },
            }))
          )
        );
      }

      // without JS the curtain never lifts, which would cover everything above
      html = html.replace(
        '</head>',
        '  <noscript><style>.curtain{display:none!important}</style></noscript>\n  </head>'
      );

      return html;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [cleanUrls(), prerenderForCrawlers(), guestbookDev(env)],
    /* the Google client id is public by design; baked in at build time */
    define: {
      __SUPABASE_URL__: JSON.stringify(env.SUPABASE_URL || ''),
      __SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(env.SUPABASE_PUBLISHABLE_KEY || ''),
    },
    build: {
      rollupOptions: {
        input: {
          home: resolve(__dirname, 'home.html'),
          journey: resolve(__dirname, 'journey.html'),
          experience: resolve(__dirname, 'experience.html'),
          blog: resolve(__dirname, 'blog.html'),
          contact: resolve(__dirname, 'contact.html'),
          privacy: resolve(__dirname, 'privacy.html'),
          terms: resolve(__dirname, 'terms.html'),
          account: resolve(__dirname, 'account.html'),
          expP10x: resolve(__dirname, 'experience/ai-specialist-p10x-media.html'),
          expOrion: resolve(__dirname, 'experience/orion-automation-founder.html'),
          expGamuda: resolve(__dirname, 'experience/gamuda-ai-academy.html'),
          expBootcamp: resolve(__dirname, 'experience/jomhack-python-bootcamp.html'),
          expHygr: resolve(__dirname, 'experience/hygr-content-creator.html'),
          expCollege: resolve(__dirname, 'experience/college-community-pasir-salak.html'),
        },
      },
      chunkSizeWarningLimit: 800,
    },
    server: {
      port: 5173,
    },
  };
});
