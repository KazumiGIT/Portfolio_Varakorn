// ---------------------------------------------------------------------------
// The profile card: click a name anywhere in the guestbook and a small card
// pops up with their photo, name, title, bio and social links, the way chat
// apps do it. One card element for the whole page, filled on demand.
// Styling lives in comments.css under "profile card".
// ---------------------------------------------------------------------------

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

/* domain -> the name people know it by; anything else shows its hostname */
const KNOWN = [
  [/instagram\.com/i, 'Instagram'],
  [/facebook\.com|fb\.com/i, 'Facebook'],
  [/linkedin\.com/i, 'LinkedIn'],
  [/tiktok\.com/i, 'TikTok'],
  [/youtube\.com|youtu\.be/i, 'YouTube'],
  [/github\.com/i, 'GitHub'],
  [/x\.com|twitter\.com/i, 'X'],
  [/wa\.me|whatsapp\.com/i, 'WhatsApp'],
  [/t\.me|telegram\.org/i, 'Telegram'],
  [/behance\.net/i, 'Behance'],
  [/dribbble\.com/i, 'Dribbble'],
];

export function linkLabel(url) {
  for (const [re, label] of KNOWN) if (re.test(url)) return label;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Link';
  }
}

let card = null;

function build() {
  if (card) return card;
  card = document.createElement('div');
  card.className = 'pcard';
  card.innerHTML = `
    <div class="pcard-scrim" data-pc-close></div>
    <div class="pcard-box" role="dialog" aria-modal="true" aria-label="Profile">
      <button class="pcard-close" type="button" data-pc-close aria-label="Close">&#10005;</button>
      <div class="pcard-band" aria-hidden="true"></div>
      <div class="pcard-ava-wrap"></div>
      <div class="pcard-body">
        <h3 class="pcard-name"></h3>
        <p class="pcard-title" hidden></p>
        <p class="pcard-bio" hidden></p>
        <div class="pcard-links" hidden></div>
      </div>
    </div>`;
  document.body.appendChild(card);
  card.addEventListener('click', (e) => {
    if (e.target.closest('[data-pc-close]')) closeProfileCard();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProfileCard();
  });
  return card;
}

export function closeProfileCard() {
  card?.classList.remove('is-open');
}

/** person: { name, picture, title, bio, links } — all but name optional. */
export function showProfileCard(person) {
  build();

  card.querySelector('.pcard-ava-wrap').innerHTML = person.picture
    ? `<img class="pcard-ava" src="${esc(person.picture)}" alt="" referrerpolicy="no-referrer" />`
    : `<span class="pcard-ava pcard-ava--letter">${esc((person.name || '?')[0].toUpperCase())}</span>`;

  card.querySelector('.pcard-name').textContent = person.name || 'Guest';

  const title = card.querySelector('.pcard-title');
  title.hidden = !person.title;
  title.textContent = person.title || '';

  const bio = card.querySelector('.pcard-bio');
  bio.hidden = !person.bio;
  bio.textContent = person.bio || '';

  const links = Array.isArray(person.links) ? person.links.filter(Boolean) : [];
  const linksEl = card.querySelector('.pcard-links');
  linksEl.hidden = links.length === 0;
  linksEl.innerHTML = links
    .map(
      (l) => `<a class="pcard-link" href="${esc(l)}" target="_blank" rel="noopener noreferrer">${esc(linkLabel(l))}</a>`
    )
    .join('');

  card.classList.add('is-open');
  card.querySelector('.pcard-close').focus({ preventScroll: true });
}

/**
 * Delegate clicks on [data-pc] elements inside host to the card. The person
 * data comes from a registry the mounting module fills while rendering.
 */
export function bindProfileClicks(host, registry) {
  if (host.dataset.pcBound) return;
  host.dataset.pcBound = '1';
  host.addEventListener('click', (e) => {
    const el = e.target.closest('[data-pc]');
    if (!el) return;
    const person = registry.get(el.dataset.pc);
    if (person) showProfileCard(person);
  });
}
