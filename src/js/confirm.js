// ---------------------------------------------------------------------------
// A small styled confirmation, promise shaped, because the native confirm()
// looks like a system error and cannot say anything kindly.
//   const yes = await askConfirm({ title, message, yes: 'Do it', no: 'Not yet' })
// Escape, the scrim, and the no button all resolve false.
// Styling lives in comments.css under "confirm".
// ---------------------------------------------------------------------------

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

let box = null;
let resolver = null;

function settle(answer) {
  box?.classList.remove('is-open');
  const r = resolver;
  resolver = null;
  r?.(answer);
}

function build() {
  if (box) return box;
  box = document.createElement('div');
  box.className = 'vkconfirm';
  box.innerHTML = `
    <div class="vkc-scrim" data-no></div>
    <div class="vkc-card" role="alertdialog" aria-modal="true" aria-labelledby="vkc-title">
      <h3 class="vkc-title" id="vkc-title"></h3>
      <p class="vkc-msg"></p>
      <div class="vkc-actions">
        <button class="btn vkc-yes" type="button"></button>
        <button class="vkc-no" type="button" data-no></button>
      </div>
    </div>`;
  document.body.appendChild(box);
  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-no]')) settle(false);
    else if (e.target.closest('.vkc-yes')) settle(true);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resolver) settle(false);
  });
  return box;
}

export function askConfirm({ title, message, yes = 'Yes', no = 'Not yet', danger = false }) {
  build();
  box.querySelector('.vkc-title').textContent = title;
  box.querySelector('.vkc-msg').innerHTML = message; // callers pass trusted, escaped strings
  const yesBtn = box.querySelector('.vkc-yes');
  yesBtn.textContent = yes;
  yesBtn.classList.toggle('is-danger', danger);
  box.querySelector('.vkc-no').textContent = no;
  box.classList.add('is-open');
  yesBtn.focus({ preventScroll: true });
  return new Promise((resolve) => {
    resolver = resolve;
  });
}

export { esc as escConfirm };
