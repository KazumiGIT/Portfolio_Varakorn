// ---------------------------------------------------------------------------
// The desk terminal: a retro chat interface drawn onto a canvas texture and
// mapped onto the monitor screen. Typing goes through a hidden input (so
// phone keyboards work too); replies come from /api/chat (Gemini, key server
// side) and reveal with a typewriter effect. BBC Micro energy on purpose.
// ---------------------------------------------------------------------------
import * as THREE from 'three';

const W = 832;
const H = 512;
const FONT = '700 21px Consolas, Menlo, monospace';
const SMALL = '700 15px Consolas, Menlo, monospace';
const LINE_H = 27;
const COLS = 50;
const PAD = 46;

const INK = '#f0e6d0';
const AMBER = '#d9a441';
const GREEN = '#9fbf72';
const DIM = '#8a7c5e';
const BG = '#1d2014';

const GREETING = [
  { color: GREEN, text: 'Hello. I am the desk terminal, Varakorn’s tiny AI.' },
  { color: GREEN, text: 'Ask me anything about him: work, projects, story.' },
  { color: DIM, text: 'try: what does varakorn build?' },
];

function wrap(text, cols) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      if (!line.length) line = word;
      else if ((line + ' ' + word).length <= cols) line += ' ' + word;
      else {
        out.push(line);
        line = word.length > cols ? word.slice(0, cols) : word;
      }
      while (line.length > cols) {
        out.push(line.slice(0, cols));
        line = line.slice(cols);
      }
    }
    out.push(line);
  }
  return out;
}

export function createTerminal() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const state = {
    active: false,
    lines: [], // { text, color }
    input: '',
    busy: false,
    reveal: null, // { text, color, shown }
    history: [], // { role, text } for the API
    blink: 0,
    dots: 0,
  };

  // hidden input: focusing it summons the phone keyboard and captures typing
  const field = document.createElement('input');
  field.type = 'text';
  field.autocomplete = 'off';
  field.maxLength = 160;
  field.setAttribute('aria-label', 'Ask the terminal about Varakorn');
  Object.assign(field.style, {
    position: 'fixed',
    bottom: '8px',
    left: '50%',
    width: '2px',
    height: '2px',
    opacity: '0',
    border: 'none',
    padding: '0',
    zIndex: '-1',
  });
  document.body.appendChild(field);

  const onType = { cb: null }; // set by the scene to animate 3D keys

  field.addEventListener('input', () => {
    const v = field.value;
    if (v.length > state.input.length && onType.cb) {
      for (const ch of v.slice(state.input.length)) onType.cb(ch);
    }
    state.input = v;
    draw();
  });

  function push(text, color) {
    for (const l of wrap(text, COLS)) state.lines.push({ text: l, color });
    if (state.lines.length > 60) state.lines.splice(0, state.lines.length - 60);
  }

  async function submit() {
    const q = state.input.trim();
    if (!q || state.busy) return;
    state.input = '';
    field.value = '';
    push('> ' + q, AMBER);
    state.history.push({ role: 'user', text: q });
    if (state.history.length > 10) state.history.splice(0, state.history.length - 10);
    state.busy = true;
    draw();
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: state.history }),
      });
      const data = await r.json().catch(() => ({}));
      let reply;
      if (data.offline) {
        reply = 'I am offline right now: no API key on this machine. The human version replies on WhatsApp though.';
      } else if (!r.ok || !data.reply) {
        reply = 'Signal lost. Give it a second and ask again.';
      } else {
        reply = data.reply;
      }
      state.history.push({ role: 'model', text: reply });
      state.reveal = { text: reply, color: GREEN, shown: 0 };
    } catch {
      state.reveal = { text: 'Signal lost. Give it a second and ask again.', color: GREEN, shown: 0 };
    }
    state.busy = false;
    draw();
  }

  function draw() {
    g.fillStyle = BG;
    g.fillRect(0, 0, W, H);

    // double border, BBC style
    g.strokeStyle = INK;
    g.lineWidth = 3;
    g.strokeRect(14, 14, W - 28, H - 28);
    g.strokeRect(22, 22, W - 44, H - 44);

    // title bar
    g.font = FONT;
    g.textAlign = 'center';
    g.fillStyle = AMBER;
    g.fillText('VARAKORN  ·  PERSONAL TERMINAL', W / 2, 56);
    g.strokeStyle = DIM;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(22, 74);
    g.lineTo(W - 22, 74);
    g.stroke();

    // chat lines, bottom anchored above the input row
    g.textAlign = 'left';
    const inputY = H - 64;
    const revealLines = state.reveal
      ? wrap(state.reveal.text.slice(0, Math.ceil(state.reveal.shown)), COLS)
      : [];
    const total = [...state.lines.map((l) => l), ...revealLines.map((text) => ({ text, color: state.reveal.color }))];
    const maxRows = Math.floor((inputY - 96) / LINE_H);
    const view = total.slice(-maxRows);
    let y = inputY - 16 - (view.length - 1) * LINE_H;
    if (state.busy) y -= LINE_H;
    for (const l of view) {
      g.fillStyle = l.color;
      g.fillText(l.text, PAD, y);
      y += LINE_H;
    }
    if (state.busy) {
      g.fillStyle = DIM;
      g.fillText('thinking' + '.'.repeat(1 + (Math.floor(state.dots) % 3)), PAD, y);
    }

    // input row
    g.strokeStyle = DIM;
    g.beginPath();
    g.moveTo(22, inputY);
    g.lineTo(W - 22, inputY);
    g.stroke();
    g.fillStyle = INK;
    const caret = state.blink % 1 < 0.55 ? '█' : ' ';
    const shown = state.input.length > COLS - 4 ? state.input.slice(-(COLS - 4)) : state.input;
    g.fillText('> ' + shown + caret, PAD, H - 36);

    g.font = SMALL;
    g.fillStyle = DIM;
    g.textAlign = 'center';
    g.fillText('ENTER send  ·  ESC leave  ·  subject: Varakorn only', W / 2, H - 12);
    g.font = FONT;
    g.textAlign = 'left';

    texture.needsUpdate = true;
  }

  function setActive(on) {
    if (state.active === on) return;
    state.active = on;
    if (on) {
      if (!state.lines.length) GREETING.forEach((l) => push(l.text, l.color));
      field.value = '';
      state.input = '';
      field.focus({ preventScroll: true });
      draw();
    } else {
      field.blur();
    }
  }

  function update(dt) {
    if (!state.active) return;
    state.blink += dt * 1.6;
    if (state.busy) {
      state.dots += dt * 3;
      draw();
    } else if (state.reveal) {
      state.reveal.shown += dt * 60; // typewriter
      if (state.reveal.shown >= state.reveal.text.length) {
        push(state.reveal.text, state.reveal.color);
        state.reveal = null;
      }
      draw();
    } else if (Math.floor(state.blink * 2) % 2 === 0) {
      draw(); // keep the caret blinking
    }
  }

  draw();

  // tiny debug handle for the verification scripts
  if (typeof window !== 'undefined') {
    window.__terminal = {
      get lines() {
        return state.lines.map((l) => l.text);
      },
      get active() {
        return state.active;
      },
      get busy() {
        return state.busy || !!state.reveal;
      },
    };
  }

  return { texture, field, state, setActive, submit, update, onType };
}
