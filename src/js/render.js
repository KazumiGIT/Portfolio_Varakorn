// Tiny data-to-DOM helpers shared by the page entries.
import { socials } from './data.js';

export function renderSocials() {
  document.querySelectorAll('[data-socials]').forEach((ul) => {
    ul.innerHTML = socials
      .map(
        (s) =>
          `<li><a href="${s.href}" target="_blank" rel="noopener noreferrer">${s.label}</a></li>`
      )
      .join('');
  });
}

export const tagList = (items, extra = '') =>
  items.map((t) => `<span class="tag ${extra}">${t}</span>`).join('');
