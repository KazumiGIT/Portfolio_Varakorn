import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';

const PAGES = ['home', 'journey', 'experience', 'blog', 'contact'];

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [cleanUrls(), aiChatDev(env)],
    build: {
      rollupOptions: {
        input: {
          home: resolve(__dirname, 'home.html'),
          journey: resolve(__dirname, 'journey.html'),
          experience: resolve(__dirname, 'experience.html'),
          blog: resolve(__dirname, 'blog.html'),
          contact: resolve(__dirname, 'contact.html'),
        },
      },
      chunkSizeWarningLimit: 800,
    },
    server: {
      port: 5173,
    },
  };
});
