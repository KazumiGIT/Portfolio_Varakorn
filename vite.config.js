import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';

const PAGES = [
  'home',
  'journey',
  'experience',
  'blog',
  'contact',
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

/** Dev twin of the Vercel function api/chat.js so the desk terminal AI works
    on localhost. Reads GEMINI_API_KEY from .env via loadEnv. */
function aiChatDev(env) {
  const handle = (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('content-type', 'application/json');
      res.end('{"error":"POST only"}');
      return;
    }
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', async () => {
      res.setHeader('content-type', 'application/json');
      try {
        const { askVarakornAI } = await import('./api/_lib/gemini.js');
        const body = raw ? JSON.parse(raw) : {};
        const out = await askVarakornAI(body.messages, { ...process.env, ...env });
        res.end(JSON.stringify(out.offline ? { reply: null, offline: true } : { reply: out.reply }));
      } catch (e) {
        res.statusCode = e.status || 500;
        res.end(JSON.stringify({ error: e.message || 'error' }));
      }
    });
  };
  return {
    name: 'ai-chat-dev',
    configureServer(server) {
      server.middlewares.use('/api/chat', handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/chat', handle);
    },
  };
}

/** Dev twins of the guestbook Vercel functions (api/auth.js, api/comments.js,
    api/like.js). The handlers are written to run both on Vercel and as plain
    connect middleware, so they mount directly. Env comes from .env. */
function guestbookDev(env) {
  const mount = (server) => {
    for (const k of ['DATABASE_URL', 'GOOGLE_CLIENT_ID', 'SESSION_SECRET']) {
      if (env[k] && !process.env[k]) process.env[k] = env[k];
    }
    for (const [route, mod] of [
      ['/api/auth', './api/auth.js'],
      ['/api/comments', './api/comments.js'],
      ['/api/like', './api/like.js'],
    ]) {
      server.middlewares.use(route, (req, res) =>
        import(mod).then((m) => m.default(req, res))
      );
    }
  };
  return { name: 'guestbook-dev', configureServer: mount, configurePreviewServer: mount };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [cleanUrls(), aiChatDev(env), guestbookDev(env)],
    /* the Google client id is public by design; baked in at build time */
    define: {
      __GOOGLE_CLIENT_ID__: JSON.stringify(env.GOOGLE_CLIENT_ID || ''),
    },
    build: {
      rollupOptions: {
        input: {
          home: resolve(__dirname, 'home.html'),
          journey: resolve(__dirname, 'journey.html'),
          experience: resolve(__dirname, 'experience.html'),
          blog: resolve(__dirname, 'blog.html'),
          contact: resolve(__dirname, 'contact.html'),
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
